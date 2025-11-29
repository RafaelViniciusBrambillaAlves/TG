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

  // estados para modal de exclusão
  const [toDelete, setToDelete] = useState<Need | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        const nid =
          typeof n.centerId === "string"
            ? n.centerId
            : (n.centerId as any)?._id;
        return nid === filters.centerId;
      })
      .filter((n) => {
        if (!filters.emergencyId) return true;
        const ne =
          typeof n.emergencyId === "string"
            ? n.emergencyId
            : (n.emergencyId as any)?._id;
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

  // listener Esc para fechar modal de exclusão
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setToDelete(null);
        setIsDeleting(false);
        setDeleteError(null);
      }
    };
    if (toDelete) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toDelete]);

  // confirma exclusão — faz otimista + rollback se falhar
  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    const id = toDelete._id;
    setIsDeleting(true);
    setDeleteError(null);

    const prev = localNeeds;
    // otimista
    internalDelete(id);

    try {
      await api.delete(`/api/v1/necessidades/${id}`);
      // notifica pai se quiser sincronizar estado externo
      if (onDelete) onDelete(id);
      // fecha modal
      setToDelete(null);
      setIsDeleting(false);
    } catch (err: any) {
      // rollback
      setLocalNeeds(prev);
      const msg = err?.message ?? "Falha ao excluir. Tente novamente.";
      setDeleteError(msg);
      setIsDeleting(false);
    }
  };

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
                ((emergencyObj as any).titulo ??
                  (emergencyObj as any).title)) ??
              undefined;

            return (
              <article key={n.id} className={styles.card}>
                {n.image && (
                  <img
                    src={
                      n.image.startsWith("http")
                        ? n.image
                        : `${process.env.API_URL}${n.image}`
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
                          await api.post(
                            `/api/v1/necessidades/ajudar/${n._id}`,
                            {
                              userId: user?._id,
                            },
                          );
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
                  <p className={styles.description}>
                    Emergência: {emergencyLabel}
                  </p>
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

                    {/* Delete -> abre modal (em vez do confirm) */}
                    <button
                      className={styles.iconBtn}
                      title="Excluir necessidade"
                      onClick={() => setToDelete(n)}
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

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {toDelete && (
        <div
          style={modalStyles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          onClick={() => {
            if (!isDeleting) {
              setToDelete(null);
              setDeleteError(null);
            }
          }}
        >
          <div style={modalStyles.dialog} onClick={(e) => e.stopPropagation()}>
            <h3 id="confirm-delete-title" style={modalStyles.title}>
              Excluir necessidade
            </h3>
            <p style={modalStyles.text}>
              Tem certeza que deseja excluir "
              <strong>{toDelete.title ?? "esta necessidade"}</strong>"? Esta
              ação não poderá ser desfeita.
            </p>

            {deleteError && (
              <div style={modalStyles.alert} role="alert">
                {deleteError}
              </div>
            )}

            <div style={modalStyles.actions}>
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setToDelete(null);
                    setDeleteError(null);
                  }
                }}
                disabled={isDeleting}
                style={modalStyles.cancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={modalStyles.danger}
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

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

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 1100,
  } as React.CSSProperties,
  dialog: {
    background: "#fff",
    borderRadius: "8px",
    padding: "20px",
    width: "min(520px, 100%)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  } as React.CSSProperties,
  title: {
    color: "#333",
    margin: "0 0 8px 0",
    fontSize: "1.25rem",
    fontWeight: 600,
  } as React.CSSProperties,
  text: {
    margin: "0 0 16px 0",
    lineHeight: 1.5,
    color: "#333",
  } as React.CSSProperties,
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "16px",
  } as React.CSSProperties,
  cancel: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#333",
    cursor: "pointer",
  } as React.CSSProperties,
  danger: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid",
    background: "#f43f5e",
    color: "#fff",
    cursor: "pointer",
  } as React.CSSProperties,
  alert: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    padding: "8px 10px",
    marginTop: "8px",
  } as React.CSSProperties,
};
