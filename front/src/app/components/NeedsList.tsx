"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./needs.module.css";
import CreateNeedModal from "./CreateNeedModal";
import { Need } from "@/app/mocks";
import { FiHeart, FiMapPin, FiClock, FiEdit, FiTrash2 } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { getNecessidades } from "@/hooks/getNecessidades";
import { Centro, getCentros } from "@/hooks/getCentros";
import { Emergencia, getEmergencias } from "@/hooks/getEmergencias";
import api from "@/services/api";
import { Usuario } from "@/hooks/getVoluntarios";

type Props = {
  needs?: Need[];
  currentUser?: string;
  onEdit?: (need: Need) => void;
  onDelete?: (id: string) => void;
};

export default function NeedsList({
  needs,
  currentUser = "Você (test)",
  onEdit,
  onDelete,
}: Props) {
  const [localNeeds, setLocalNeeds] = useState<Need[]>(needs ?? []);
  const [centers, setCenters] = useState<Centro[]>([]);
  const [emergencies, setEmergencies] = useState<Emergencia[]>([]);
  const [editingNeed, setEditingNeed] = useState<Need | null>(null);
  const [user, setUser] = useState<Usuario | null>(null);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    centerId: "",
    emergencyId: "",
  });

  // Mantém localNeeds em sincronia com o pai (se a prop 'needs' for usada pelo pai)
  useEffect(() => {
    if (needs) setLocalNeeds(needs);
  }, [needs]);

  const filteredNeeds = useMemo(() => {
    return localNeeds
      .filter((n) => !filters.type || n.type === filters.type)
      .filter((n) => !filters.status || n.status === filters.status)
      .filter((n) => {
        if (!filters.centerId) return true;
        const nid = typeof n.centerId === "string" ? n.centerId : (n.centerId as any)?._id;
        return nid === filters.centerId;
      })
      .filter((n) => {
        if (!filters.emergencyId) return true;
        const ne = typeof n.emergencyId === "string" ? n.emergencyId : (n.emergencyId as any)?._id;
        return ne === filters.emergencyId;
      });
  }, [localNeeds, filters]);

  // helpers para buscar center/emergency aceitando ambos os formatos
  const findCenter = (id?: string | { _id?: string } | null) => {
    const _id = typeof id === "string" ? id : id?._id;
    if (!_id) return undefined;
    return centers.find((c) => c._id === _id);
  };

  const findEmergency = (id?: string | { _id?: string } | null) => {
    const _id = typeof id === "string" ? id : id?._id;
    if (!_id) return undefined;
    return emergencies.find((e) => e._id === _id);
  };

  const currentOrg = useMemo(() => {
    try {
      const u = localStorage.getItem("usuario");
      if (!u) return {} as any;
      const parsed = JSON.parse(u);
      setUser(parsed);
      return parsed.organizations?.[0] ?? {};
    } catch {
      return {} as any;
    }
  }, [currentUser]);

  // filtrar centros pela org atual (cuidado se currentOrg for {})
  const centersOfMyOrg = useMemo(() => {
    const orgId = (currentOrg as any)?._id;
    if (!orgId) return centers;
    return centers.filter((c) => c.orgId === orgId);
  }, [currentOrg, centers]);

  const timeAgo = (iso: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (diff < 60) return `${diff}s`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m`;
      if (diff < 3600 * 24) return `${Math.floor(diff / 3600)}h`;
      return `${Math.floor(diff / (3600 * 24))}d`;
    } catch {
      return "algum tempo";
    }
  };

  const internalDelete = (id: string) =>
    setLocalNeeds((prev) => prev.filter((n) => n._id !== id));

  const handleUpdate = (updated: Need) => {
    setLocalNeeds((prev) =>
      prev.map((n) => (n._id === updated._id ? updated : n)),
    );
    if (onEdit) onEdit(updated);
  };

  // Busca dados somente se o pai NÃO passar 'needs'
  useEffect(() => {
    if (!needs || needs.length === 0) {
      getNecessidades()
        .then((data) => setLocalNeeds(data))
        .catch((err) => console.warn("getNecessidades failed:", err));
    }

    getCentros()
      .then((data) => setCenters(data))
      .catch((err) => console.warn("getCentros failed:", err));

    getEmergencias()
      .then((data) => setEmergencies(data))
      .catch((err) => console.warn("getEmergencias failed:", err));
  }, [needs]);

  return (
    <section className={styles.wrap} aria-label="Necessidades">
      <header className={styles.header}>
        <h2 className={styles.title}>Necessidades — Meus centros</h2>
        <p className={styles.subtitle}>
          Lista de necessidades dos centros vinculados à sua ONG (
          {(currentOrg as any)?.nome ?? "—"}).
        </p>
      </header>

      {/* FILTROS */}
      <div className={styles.filters}>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">Tipo: Todos</option>
          <option value="Doação">Doação</option>
          <option value="Voluntário">Voluntário</option>
          <option value="Serviço">Serviço</option>
          <option value="Outro">Outro</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Status: Todos</option>
          <option value="Aberta">Aberta</option>
          <option value="Parcial">Parcial</option>
          <option value="Atendida">Atendida</option>
        </select>

        <select
          value={filters.centerId}
          onChange={(e) => setFilters({ ...filters, centerId: e.target.value })}
        >
          <option value="">Centro: Todos</option>
          {centersOfMyOrg.map((c) => (
            <option key={c._id} value={c._id}>
              {c.nome}
            </option>
          ))}
        </select>

        <select
          value={filters.emergencyId}
          onChange={(e) =>
            setFilters({ ...filters, emergencyId: e.target.value })
          }
        >
          <option value="">Emergência: Todas</option>
          {emergencies.map((em) => (
            <option key={em._id} value={em._id}>
              {(em as any).titulo ?? (em as any).title ?? `#${em._id}`}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.list}>
        {filteredNeeds.length === 0 ? (
          <div className={styles.empty}>
            Nenhuma necessidade registrada nos seus centros no momento.
          </div>
        ) : (
          filteredNeeds.map((n) => {
            const centerObj = findCenter(n.centerId as any);
            const emergencyObj = findEmergency(n.emergencyId as any);
            const centerName = centerObj?.nome ?? "Centro desconhecido";
            const emergencyLabel =
              (emergencyObj &&
                ((emergencyObj as any).titulo ?? (emergencyObj as any).title)) ??
              undefined;

            return (
              <article key={n._id} className={styles.card}>
                {n.image && (
                  <img
                    src={
                      n.image.startsWith("http")
                        ? n.image
                        : `http://localhost:3001${n.image}`
                    }
                    alt="Imagem da necessidade"
                    style={{
                      width: 180,
                      height: "auto",
                      borderRadius: 8,
                      marginBottom: 8,
                      objectFit: "cover",
                      margin: "0 auto",
                    }}
                  />
                )}

                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.titleRow}>
                      <h3 className={styles.needTitle}>{n.title}</h3>
                      <div className={styles.typeBadge}>{n.type}</div>
                    </div>

                    <div className={styles.metaRow}>
                      <div className={styles.centerInfo}>
                        <FiMapPin /> {centerName}
                      </div>
                      {emergencyLabel ? (
                        <div className={styles.emergencyInfo}>
                          <FiClock /> Vinculado: {emergencyLabel}
                        </div>
                      ) : null}
                      <div className={styles.timeInfo}>
                        Criado há {timeAgo(n.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className={styles.stats}>
                    <button
                      onClick={async () => {
                        try {
                          await api.post(`/api/v1/necessidades/ajudar/${n._id}`, {
                            userId: user?._id,
                          });
                        } catch (err) {
                          console.warn("Erro ao registrar interesse:", err);
                        }
                      }}
                      className={styles.interestCount}
                      aria-label="Ajudar / marcar interesse"
                    >
                      {n.interest?.find((e) => e === user?._id) ? (
                        <FaHeart />
                      ) : (
                        <FiHeart />
                      )}
                      <span>{n.interest?.length ?? 0}</span>
                    </button>
                    <div className={styles.status}>{n.status}</div>
                  </div>
                </div>

                <p className={styles.description}>{n.description}</p>

                {emergencyLabel ? (
                  <p className={styles.description}>Emergência: {emergencyLabel}</p>
                ) : (
                  <p className={styles.description}>Emergência: —</p>
                )}

                <div className={styles.footer}>
                  <div className={styles.quantity}>
                    {n.quantity ? `Quantidade necessária: ${n.quantity}` : ""}
                  </div>

                  <div className={styles.actions}>
                    {/* Edit */}
                    <button
                      className={styles.iconBtn}
                      title="Editar necessidade"
                      onClick={() => setEditingNeed(n)}
                    >
                      <FiEdit />
                    </button>

                    {/* Delete */}
                    <button
                      className={styles.iconBtn}
                      title="Excluir necessidade"
                      onClick={async () => {
                        if (confirm("Tem certeza que deseja excluir esta necessidade?")) {
                          // Exclusão otimista na lista local
                          const prev = localNeeds;
                          internalDelete(n._id);
                          try {
                            await api.delete(`/api/v1/necessidades/${n._id}`);
                            // Notifica o pai (se quiser manter o estado no pai em sincronia)
                            if (onDelete) onDelete(n._id);
                          } catch (err) {
                            // rollback se falhar
                            setLocalNeeds(prev);
                            console.warn("Erro ao excluir necessidade:", err);
                            alert("Falha ao excluir. Tente novamente.");
                          }
                        }
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {editingNeed && (
        <CreateNeedModal
          open={!!editingNeed}
          onClose={() => setEditingNeed(null)}
          onCreate={handleUpdate}
          centersFilterOrgId={(currentOrg as any)?._id}
          centers={centersOfMyOrg}
          emergencies={emergencies}
          {...editingNeed}
        />
      )}
    </section>
  );
}
