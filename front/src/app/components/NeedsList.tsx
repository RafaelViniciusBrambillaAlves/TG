"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./needs.module.css";
import CreateNeedModal from "./CreateNeedModal";
import {
  MOCK_NEEDS,
  Need,
  MOCK_CENTERS,
  Center,
  MOCK_EMERGENCIES,
  Emergency,
  MOCK_ONGS,
} from "@/app/mocks";
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

  const filteredNeeds = useMemo(() => {
    return localNeeds
      .filter((n) => !filters.type || n.type === filters.type)
      .filter((n) => !filters.status || n.status === filters.status)
      .filter((n) => !filters.centerId || n.centerId === filters.centerId)
      .filter(
        (n) => !filters.emergencyId || n.emergencyId === filters.emergencyId,
      );
  }, [localNeeds, filters]);

  const findCenter = (id: string) =>
    centers.find((c) => c._id === id) as Center | undefined;
  const findEmergency = (id?: string) =>
    id
      ? (emergencies.find((e) => e._id === id) as Emergency | undefined)
      : undefined;

  const currentOrg = useMemo(() => {
    // Exemplo: pegar do localStorage (ajuste para sua estrutura)
    const user = JSON.parse(localStorage.getItem("usuario") || "{}");
    setUser(user);
    return user.organizations?.[0]; // Fallback
  }, [currentUser]);
  // Corrigido: filtrar centros pela ONG atual
  const centersOfMyOrg = useMemo(() => {
    return centers.filter((c) => c.orgId === currentOrg._id);
  }, [currentOrg, centers]);

  const timeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 3600 * 24) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / (3600 * 24))}d`;
  };

  const internalDelete = (id: string) =>
    setLocalNeeds((prev) => prev.filter((n) => n._id !== id));

  const handleUpdate = (updated: Need) => {
    setLocalNeeds((prev) =>
      prev.map((n) => (n._id === updated._id ? updated : n)),
    );
    if (onEdit) onEdit(updated);
  };

  useEffect(() => {
    getNecessidades()
      .then(async (data) => {
        setLocalNeeds(data);
      })
      .catch((err) => console.warn("getNecessidades failed:", err));

    getCentros()
      .then(async (data) => {
        setCenters(data);
      })
      .catch((err) => console.warn("getCentros failed:", err));

    getEmergencias()
      .then(async (data) => {
        setEmergencies(data);
      })
      .catch((err) => console.warn("getEmergencias failed:", err));
  }, []);

  return (
    <section className={styles.wrap} aria-label="Necessidades">
      <header className={styles.header}>
        <h2 className={styles.title}>Necessidades — Meus centros</h2>
        <p className={styles.subtitle}>
          Lista de necessidades dos centros vinculados à sua ONG (
          {currentOrg.nome}).
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
              {em.titulo}
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
            const center = findCenter(n.centerId._id);
            const emergency = findEmergency(n.emergencyId);

            return (
              <article key={n.id} className={styles.card}>
                {n.image &&
                  <img src={`http://localhost:3001${n.image}`} alt="Imagem da necessidade" />
                }
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.titleRow}>
                      <h3 className={styles.needTitle}>{n.title}</h3>
                      <div className={styles.typeBadge}>{n.type}</div>
                    </div>

                    <div className={styles.metaRow}>
                      <div className={styles.centerInfo}>
                        <FiMapPin /> {center?.nome ?? "Centro desconhecido"}
                      </div>
                      {emergency ? (
                        <div className={styles.emergencyInfo}>
                          <FiClock /> Vinculado: {emergency.title}
                        </div>
                      ) : null}
                      <div className={styles.timeInfo}>
                        Criado há {timeAgo(n.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className={styles.stats}>
                    <button onClick={async () => {
                        await api.post(`/api/v1/necessidades/ajudar/${n._id}`, {
                          userId: user?._id,
                        });
                      }}
                      className={styles.interestCount}
                    >
                      {n.interest.find(e => e === user?._id) ?
                        <FaHeart /> :
                        <FiHeart />
                      }
                    <span>{n.interest.length ?? 0}</span>
                    </button>
                    <div className={styles.status}>{n.status}</div>
                  </div>
                </div>

                <p className={styles.description}>{n.description}</p>
                <p className={styles.description}>Emergencia: {n.emergencyId.titulo}</p>

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
                      onClick={() => {
                        if (
                          confirm(
                            "Tem certeza que deseja excluir esta necessidade?",
                          )
                        ) {
                          if (onDelete) onDelete(n._id);
                          else internalDelete(n._id);
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
          centersFilterOrgId={currentOrg._id}
          centers={centersOfMyOrg} // Passe a lista filtrada
          emergencies={emergencies} // Passe a lista de emergências
          {...editingNeed}
        />
      )}
    </section>
  );
}
