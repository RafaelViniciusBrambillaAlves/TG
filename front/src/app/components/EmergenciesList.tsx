"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./centers.module.css";
import drawerStyles from "./centersModal.module.css";
import {
  MOCK_EMERGENCIES,
  Emergency,
  MOCK_CENTERS,
  Center,
  MOCK_ONGS,
  ONG,
} from "@/app/mocks";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Emergencia } from "@/hooks/getEmergencias";

type Props = {
  emergencies?: Emergencia[];
  currentUser?: string;
  onEdit?: (e: Emergencia) => void;
  onDelete?: (id: string) => void;
};

function shortTimeAgo(iso: string) {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (isNaN(diffSec)) return new Date(iso).toLocaleString();
  if (diffSec < 60) return `${diffSec}s`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 3600 * 24) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / (3600 * 24))}d`;
}

export default function EmergenciesList({
  emergencies,
  currentUser = "Você (test)",
  onEdit,
  onDelete,
}: Props) {
  const [localEmergencies, setLocalEmergencies] = useState<Emergencia[]>(
    emergencies || [],
  );
  useEffect(() => setLocalEmergencies(emergencies || []), [emergencies]);

  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "24h" | "week">("all");
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(
    null,
  );
  const [profileOrgId, setProfileOrgId] = useState<string | null>(null);

  // NOTE: default org id used when a normal user (not logged as an ONG) declares interest.
  // You previously put "Minha ONG Exemplo" in mocks with id "o4" — we'll use that as the default.
  // If you later wire real auth, replace this with the user's actual org id.

  const sorted = useMemo(() => {
    const copy = [...localEmergencies];
    copy.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return copy;
  }, [localEmergencies]);

  const filtered = useMemo(() => {
    return sorted.filter((e) => {
      if (filter === "mine" && e.id_usuario._id !== currentUser) return false;
      if (timeFilter === "24h")
        return Date.now() - new Date(e.createdAt).getTime() < 24 * 3600 * 1000;
      if (timeFilter === "week")
        return (
          Date.now() - new Date(e.createdAt).getTime() < 7 * 24 * 3600 * 1000
        );
      return true;
    });
  }, [sorted, filter, timeFilter, currentUser]);

  const selectedEmergency = selectedEmergencyId
    ? (localEmergencies.find((x) => x.id === selectedEmergencyId) ?? null)
    : null;

  // If currentUser equals the ONG name, this is an org-admin session
  const currentUserOrg = MOCK_ONGS.find((o) => o.name === currentUser) ?? null;
  const currentUserOrgId = currentUserOrg?.id ?? null;

  const findOrgById = (id?: string) =>
    id ? MOCK_ONGS.find((o) => o.id === id) : undefined;
  const findCentersForOrg = (orgId?: string) =>
    orgId ? MOCK_CENTERS.filter((c) => c.orgId === orgId) : [];

  // Admin toggles interest for their ONG (add/remove orgId from emergency.helpingOrgs)
  const toggleInterestByOrgId = (emId: string, orgId: string) => {
    setLocalEmergencies((prev) =>
      prev.map((e) => {
        if (e.id !== emId) return e;
        const cur = new Set(e.helpingOrgs ?? []);
        if (cur.has(orgId)) cur.delete(orgId);
        else cur.add(orgId);
        return { ...e, helpingOrgs: Array.from(cur) };
      }),
    );
  };

  // For normal users: add/remove the DEFAULT_USER_ORG_ID into the emergency.helpingOrgs
  const toggleParticipationAsMyOrg = (emId: string) => {
    setLocalEmergencies((prev) =>
      prev.map((e) => {
        if (e.id !== emId) return e;
        const cur = new Set(e.helpingOrgs ?? []);
        // if (cur.has(DEFAULT_USER_ORG_ID)) cur.delete(DEFAULT_USER_ORG_ID);
        // else cur.add(DEFAULT_USER_ORG_ID);
        return { ...e, helpingOrgs: Array.from(cur) };
      }),
    );
  };

  return (
    <section className={styles.wrap} aria-label="Lista de emergências">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Emergências</h2>
          <p className={styles.subtitle}>
            Apoie ou reporte situações urgentes próximas a você.
          </p>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <button
              className={filter === "all" ? styles.activeFilter : ""}
              onClick={() => setFilter("all")}
            >
              Todas
            </button>
            <button
              className={filter === "mine" ? styles.activeFilter : ""}
              onClick={() => setFilter("mine")}
            >
              Minhas
            </button>
          </div>
          <div className={styles.filterGroup}>
            <button
              className={timeFilter === "all" ? styles.activeFilter : ""}
              onClick={() => setTimeFilter("all")}
            >
              Todas
            </button>
            <button
              className={timeFilter === "24h" ? styles.activeFilter : ""}
              onClick={() => setTimeFilter("24h")}
            >
              Últimas 24h
            </button>
            <button
              className={timeFilter === "week" ? styles.activeFilter : ""}
              onClick={() => setTimeFilter("week")}
            >
              Última semana
            </button>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        {filtered.map((em) => {
          const mine = em.id_usuario._id === currentUser;
          const timeAgo = shortTimeAgo(em.createdAt);

          return (
            <article
              key={em._id}
              className={styles.card}
              aria-labelledby={`em-${em._id}-title`}
              onClick={() => {
                setSelectedEmergencyId(em._id);
                setProfileOrgId(null);
              }}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.cardLeft}>
                {em.image ? (
                  <img
                    src={em.image}
                    alt={em.titulo}
                    className={styles.thumb}
                  />
                ) : (
                  <div
                    style={{
                      width: 110,
                      height: 80,
                      borderRadius: 8,
                      background: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6b7280",
                      fontSize: 13,
                      textAlign: "center",
                      padding: 8,
                    }}
                  >
                    Sem imagem
                  </div>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <h3 id={`em-${em._id}-title`} className={styles.centerName}>
                    {em.titulo}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 6,
                      }}
                    >
                      {em.subtitulo}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: em.status === "Aberta" ? "#dc2626" : "#0b5fff",
                        fontSize: 12,
                      }}
                    >
                      {em.status}
                    </div>
                  </div>
                </div>

                <p className={styles.centerDesc}>{em.descricao}</p>

                <dl className={styles.meta}>
                  {em.address && (
                    <div>
                      <dt>Endereço</dt>
                      <dd>{em.address}</dd>
                    </div>
                  )}

                  <div className={styles.reportRow}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <dt>Reportado</dt>
                      <dd style={{ color: "#6b7280", margin: 0 }}>{timeAgo}</dd>
                    </div>

                    {mine && (
                      <div className={styles.actionIcons}>
                        <button
                          className={styles.iconButton}
                          title="Editar emergência"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onEdit?.(em);
                          }}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className={styles.iconButton}
                          title="Excluir emergência"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onDelete?.(em._id);
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                  </div>
                </dl>
              </div>
            </article>
          );
        })}
      </div>

      {/* DRAWER */}
      <div
        className={`${drawerStyles.overlay} ${selectedEmergency ? drawerStyles.show : ""}`}
        onClick={() => setSelectedEmergencyId(null)}
        aria-hidden={!selectedEmergency}
      />

      <aside
        className={`${drawerStyles.drawer} ${selectedEmergency ? drawerStyles.open : ""}`}
        aria-hidden={!selectedEmergency}
      >
        {selectedEmergency ? (
          <>
            {!profileOrgId ? (
              <>
                <header className={drawerStyles.drawerHeader}>
                  <div>
                    <h3 className={drawerStyles.drawerTitle}>
                      {selectedEmergency.titulo}
                    </h3>
                    <div className={drawerStyles.drawerSubtitle}>
                      {selectedEmergency.subtitulo}
                    </div>
                  </div>
                  <div className={drawerStyles.headerActions}>
                    <button
                      className={drawerStyles.closeButton}
                      onClick={() => setSelectedEmergencyId(null)}
                    >
                      ×
                    </button>
                  </div>
                </header>

                <div className={drawerStyles.drawerBody}>
                  <p className={drawerStyles.description}>
                    {selectedEmergency.descricao}
                  </p>

                  <div className={drawerStyles.section}>
                    <div className={drawerStyles.sectionHeader}>
                      <h4>ONGs ajudando</h4>
                      <div className={drawerStyles.sectionHint}>
                        {selectedEmergency.helpingOrgs?.length ?? 0} encontradas
                      </div>
                    </div>

                    {selectedEmergency.helpingOrgs?.length ? (
                      <ul className={drawerStyles.orgList}>
                        {selectedEmergency.helpingOrgs.map((orgId) => {
                          const org = findOrgById(orgId);
                          if (!org) return null;
                          const centers = findCentersForOrg(org.id);
                          const isMyOrg = currentUserOrgId === org.id;

                          return (
                            <li key={org.id} className={drawerStyles.orgItem}>
                              <div className={drawerStyles.orgLeft}>
                                {org.logo ? (
                                  <img
                                    src={org.logo}
                                    alt={org.name}
                                    className={drawerStyles.orgAvatar}
                                  />
                                ) : (
                                  <div
                                    className={
                                      drawerStyles.orgAvatarPlaceholder
                                    }
                                  >
                                    {(org.name || "ONG")[0]}
                                  </div>
                                )}
                              </div>

                              <div className={drawerStyles.orgMain}>
                                <div className={drawerStyles.orgNameRow}>
                                  <div
                                    className={drawerStyles.orgName}
                                    title={org.name}
                                  >
                                    {org.name}
                                  </div>
                                  <div className={drawerStyles.orgMeta}>
                                    {centers.length ? centers[0].address : ""}
                                  </div>
                                </div>
                                <div className={drawerStyles.orgDesc}>
                                  {org.description}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#6b7280",
                                    marginTop: 6,
                                  }}
                                >
                                  {centers.length
                                    ? `${centers.length} centro(s) vinculado(s)`
                                    : "Sem centros vinculados"}
                                </div>
                              </div>

                              <div className={drawerStyles.orgActions}>
                                {/* Ver perfil: NO-OP (visual only) conforme solicitado */}
                                <button
                                  className={drawerStyles.actionBtn}
                                  onClick={(e) => {
                                    e.stopPropagation(); /* intentionally no-op */
                                  }}
                                >
                                  Ver organização
                                </button>

                                {/* Only show ONG-admin control if current user represents this ONG */}
                                {isMyOrg && (
                                  <button
                                    className={`${drawerStyles.actionBtn} ${drawerStyles.solidPrimary}`}
                                    onClick={() =>
                                      toggleInterestByOrgId(
                                        selectedEmergency.id,
                                        org.id,
                                      )
                                    }
                                  >
                                    {selectedEmergency?.helpingOrgs?.includes(
                                      org.id,
                                    )
                                      ? "Retirar interesse"
                                      : "Tenho interesse"}
                                  </button>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className={drawerStyles.emptyState}>
                        <div className={drawerStyles.emptyTitle}>
                          Nenhuma ONG ajudando ainda
                        </div>
                        <div className={drawerStyles.emptyDesc}>
                          Se sua ONG quiser ajudar, abra o painel e registre seu
                          interesse.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={drawerStyles.section}>
                    {/* <h4>Participar</h4> */}

                    {/* If user is an ONG admin, show ONG toggle (existing behavior) */}
                    {currentUserOrgId ? (
                      <button
                        className={`${drawerStyles.primaryBtn} ${drawerStyles.full}`}
                        onClick={() =>
                          toggleInterestByOrgId(
                            selectedEmergency._id,
                            currentUserOrgId,
                          )
                        }
                      >
                        {selectedEmergency.helpingOrgs?.includes(
                          currentUserOrgId,
                        )
                          ? `Retirar interesse da minha ONG (${currentUser})`
                          : `Tenho interesse em ajudar como ${currentUser}`}
                      </button>
                    ) : (
                      /* Non-admin: act on behalf of the user's default ONG (add/remove it from helpingOrgs) */
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <button
                          className={`${drawerStyles.primaryBtn} ${drawerStyles.full}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleParticipationAsMyOrg(selectedEmergency.id);
                          }}
                        >
                          {selectedEmergency.helpingOrgs?.includes(
                            DEFAULT_USER_ORG_ID,
                          )
                            ? "Cancelar interesse (Minha ONG)"
                            : "Tenho interesse (Minha ONG)"}
                        </button>

                        <div style={{ color: "#6b7280", fontSize: 13 }}>
                          Ao marcar interesse aqui, sua ONG será listada em
                          "ONGs ajudando".
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* ONG profile view (kept but accessible only via separate flow if you want; not via Ver perfil button) */
              (() => {
                const org = findOrgById(profileOrgId) as ONG | undefined;
                if (!org)
                  return (
                    <div className={drawerStyles.drawerBody}>
                      Organização não encontrada
                    </div>
                  );
                const centers = findCentersForOrg(org.id);
                return (
                  <>
                    <header className={drawerStyles.drawerHeader}>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        {org.logo && (
                          <img
                            src={org.logo}
                            alt={org.name}
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: 8,
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <div>
                          <h3 className={drawerStyles.drawerTitle}>
                            {org.name}
                          </h3>
                          <div className={drawerStyles.drawerSubtitle}>
                            {org.short ?? ""}
                          </div>
                        </div>
                      </div>
                      <div className={drawerStyles.headerActions}>
                        <button
                          className={drawerStyles.closeButton}
                          onClick={() => setProfileOrgId(null)}
                        >
                          ×
                        </button>
                      </div>
                    </header>

                    <div className={drawerStyles.drawerBody}>
                      <p style={{ color: "#374151" }}>{org.description}</p>

                      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>
                          {org.phone}
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>
                          {org.email}
                        </div>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <h4 className={drawerStyles.sectionTitle}>
                          Centros vinculados
                        </h4>
                        {centers.length ? (
                          <ul
                            style={{
                              margin: 0,
                              padding: 0,
                              listStyle: "none",
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {centers.map((c) => (
                              <li
                                key={c.id}
                                style={{
                                  padding: 10,
                                  borderRadius: 8,
                                  background: "#fff",
                                  border: "1px solid rgba(16,24,40,0.04)",
                                }}
                              >
                                <div
                                  style={{ fontWeight: 700, color: "#111827" }}
                                >
                                  {c.name}
                                </div>
                                <div style={{ fontSize: 13, color: "#6b7280" }}>
                                  {c.address}
                                </div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    color: "#374151",
                                    marginTop: 6,
                                  }}
                                >
                                  {c.description}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div style={{ color: "#6b7280", fontSize: 13 }}>
                            Nenhum centro vinculado
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                        {currentUserOrgId === org.id ? (
                          <button
                            className={`${drawerStyles.primaryBtn}`}
                            onClick={() =>
                              selectedEmergency &&
                              toggleInterestByOrgId(
                                selectedEmergency._id,
                                org.id,
                              )
                            }
                          >
                            {selectedEmergency?.helpingOrgs?.includes(org.id)
                              ? "Retirar interesse da minha ONG"
                              : "Tenho interesse (minha ONG)"}
                          </button>
                        ) : (
                          <a
                            className={drawerStyles.actionBtn}
                            href={org.website ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Visitar site
                          </a>
                        )}
                        <button
                          className={drawerStyles.actionBtn}
                          onClick={() => setProfileOrgId(null)}
                        >
                          Voltar
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()
            )}
          </>
        ) : (
          <div className={drawerStyles.emptyDrawer}>
            <div>Aguardando seleção</div>
          </div>
        )}
      </aside>
    </section>
  );
}
