// src/components/ViewOrganizationModal.tsx
"use client";

import React, { useMemo, useState } from "react";
import styles from "./organizationModal.module.css";
import { ONG, Center, Emergency, Need } from "@/app/mocks";
import { X, Instagram, Twitter, Phone, Globe, Mail } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  org?: ONG | null;
  centers?: Center[];
  emergencies?: Emergency[];
  needs?: Need[];
};

export default function ViewOrganizationModal({
  open,
  onClose,
  org = null,
  centers = [],
  emergencies = [],
  needs = [],
}: Props) {
  // --- estado local (sempre declara antes de qualquer return condicional) ---
  const [activeTab, setActiveTab] = useState<
    "overview" | "centers" | "emergencies" | "needs"
  >("overview");
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);

  // --- use uma id segura (pode ser org undefined) para usar em memoizados ---
  const orgId = org?.id ?? "__NO_ORG__";

  // --- MOCK fallback (sempre declarados antes de qualquer return/condicional) ---
  const mockCenters: Center[] =
    centers && centers.length
      ? centers
      : [
          {
            id: "c1",
            name: "Centro Esperança",
            address: "Rua das Flores, 123 - São Paulo",
            description:
              "Suporte alimentar e psicológico para famílias em vulnerabilidade.",
            orgId: orgId,
            telefone: "(11) 99999-0001",
            email: "contato@centroesperanca.org",
          },
          {
            id: "c2",
            name: "Centro Vida Nova",
            address: "Av. Central, 456 - Rio de Janeiro",
            description:
              "Atendimento médico e triagem social para pessoas em situação de rua.",
            orgId: orgId,
            telefone: "(21) 98888-1111",
            email: "contato@vidanova.org",
          },
        ];

  const mockEmergencies: Emergency[] =
    emergencies && emergencies.length
      ? emergencies
      : [
          {
            id: "e1",
            title: "Enchentes na Zona Leste",
            status: "Ativa",
            helpingOrgs: [orgId],
            description:
              "Acúmulo de água e famílias desalojadas nas áreas ribeirinhas.",
          },
          {
            id: "e2",
            title: "Campanha de Agasalhos 2025",
            status: "Concluída",
            helpingOrgs: [orgId],
            description:
              "Arrecadação e distribuição de agasalhos para populações vulneráveis.",
          },
        ];

  // --- Derivados memoizados (chamados sempre, mantendo ordem de hooks) ---
  const orgCenters = useMemo(
    () => (mockCenters || []).filter((c) => (c.orgId ?? "") === orgId),
    [mockCenters, orgId]
  );

  const orgEmergencies = useMemo(
    () =>
      (mockEmergencies || []).filter((e) =>
        (e.helpingOrgs ?? []).includes(orgId)
      ),
    [mockEmergencies, orgId]
  );

  const orgNeeds = useMemo(() => {
    if (!needs || needs.length === 0) return [];
    return needs.filter((n) => {
      if (n.orgId && n.orgId === orgId) return true;
      // também tentar casar por emergencyId -> emergency.helpingOrgs
      if (n.emergencyId) {
        const em = mockEmergencies.find((me) => me.id === n.emergencyId);
        if (em && (em.helpingOrgs ?? []).includes(orgId)) return true;
      }
      return false;
    });
  }, [needs, orgId, mockEmergencies]);

  // agora podemos retornar null cedo se modal fechado ou org ausente
  if (!open || !org) return null;

  // helpers
  const formatPhoneLink = (raw?: string) => {
    if (!raw) return undefined;
    const digits = raw.replace(/\D/g, "");
    const withCountry = digits.length <= 11 ? `55${digits}` : digits;
    return `https://wa.me/${withCountry}`;
  };

  const renderStats = () => {
    const centersCount = orgCenters.length;
    const emergenciesCount = orgEmergencies.length;
    const needsCount = orgNeeds.length;
    return (
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{centersCount}</div>
          <div className={styles.statLabel}>Centros</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{emergenciesCount}</div>
          <div className={styles.statLabel}>Emergências</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{needsCount}</div>
          <div className={styles.statLabel}>Necessidades</div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="org-modal-title"
      onClick={onClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {org.logo ? (
              <img
                src={
                  org.logo.startsWith("http")
                    ? org.logo
                    : `http://localhost:3001${org.logo}`
                }
                alt={org.name}
                className={styles.logo}
              />
            ) : (
              <div className={styles.logoPlaceholder}>
                {org.name?.charAt(0)?.toUpperCase() ?? "O"}
              </div>
            )}

            <div className={styles.headerTitleWrap}>
              <h2 id="org-modal-title" className={styles.name}>
                {org.name}
              </h2>
              <div className={styles.type}>Organização Social</div>
              <div className={styles.location}>{org.city ?? org.address ?? ""}</div>
            </div>
          </div>

          <div className={styles.headerRight}>
            {renderStats()}
            <button
              onClick={onClose}
              className={styles.close}
              aria-label="Fechar modal da organização"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Contact row */}
        <div className={styles.contactRow}>
          <div className={styles.contactLeft}>
            {org.phone && (
              <a className={styles.contactItem} href={`tel:${org.phone}`}>
                <Phone size={16} /> <span>{org.phone}</span>
              </a>
            )}

            {org.email && (
              <a className={styles.contactItem} href={`mailto:${org.email}`}>
                <Mail size={16} /> <span>{org.email}</span>
              </a>
            )}

            {org.website && (
              <a
                className={styles.contactItem}
                href={org.website}
                target="_blank"
                rel="noreferrer"
              >
                <Globe size={16} />{" "}
                <span>{org.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>

          <div className={styles.contactRight}>
            {org.instagram && (
              <a
                className={styles.socialBtn}
                href={org.instagram}
                target="_blank"
                rel="noreferrer"
                title="Instagram"
              >
                <Instagram size={16} />
              </a>
            )}
            {org.twitter && (
              <a
                className={styles.socialBtn}
                href={org.twitter}
                target="_blank"
                rel="noreferrer"
                title="Twitter"
              >
                <Twitter size={16} />
              </a>
            )}
            {org.phone && (
              <a
                className={styles.socialBtn}
                href={formatPhoneLink(org.phone)}
                target="_blank"
                rel="noreferrer"
                title="Abrir WhatsApp"
              >
                <Phone size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        {org.description && <p className={styles.description}>{org.description}</p>}

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === "overview" ? styles.activeTab : ""}`}
            onClick={() => {
              setActiveTab("overview");
              setSelectedCenter(null);
              setSelectedEmergency(null);
            }}
          >
            Visão geral
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "centers" ? styles.activeTab : ""}`}
            onClick={() => {
              setActiveTab("centers");
              setSelectedCenter(null);
              setSelectedEmergency(null);
            }}
          >
            Centros
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "emergencies" ? styles.activeTab : ""}`}
            onClick={() => {
              setActiveTab("emergencies");
              setSelectedCenter(null);
              setSelectedEmergency(null);
            }}
          >
            Emergências
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "needs" ? styles.activeTab : ""}`}
            onClick={() => {
              setActiveTab("needs");
              setSelectedCenter(null);
              setSelectedEmergency(null);
            }}
          >
            Necessidades
          </button>
        </div>

        {/* Content */}
        <div className={styles.tabContent}>
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className={styles.overview}>
              <h3 className={styles.sectionTitle}>Resumo</h3>
              <p className={styles.sectionText}>
                {org.short ?? "Organização ativa, presente em diversos projetos sociais."}
              </p>

              <div className={styles.cardRow}>
                <div className={styles.infoCard}>
                  <div className={styles.infoCardTitle}>Missão</div>
                  <div className={styles.infoCardText}>
                    {org.mission ?? "Atuar em ações sociais e humanitárias."}
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoCardTitle}>Áreas de atuação</div>
                  <div className={styles.infoCardText}>
                    {org.areas?.join(", ") ?? "Assistência social, saúde, educação"}
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoCardTitle}>Contato</div>
                  <div className={styles.infoCardText}>
                    {org.email ?? "—"} <br />
                    {org.phone ?? "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CENTERS */}
          {activeTab === "centers" && (
            <div>
              {!selectedCenter ? (
                <>
                  {orgCenters.length ? (
                    <ul className={styles.centerList}>
                      {orgCenters.map((c) => (
                        <li className={styles.centerItem} key={c.id}>
                          <div className={styles.centerMain}>
                            <div className={styles.centerTitle}>{c.name}</div>
                            <div className={styles.centerAddr}>{c.address}</div>
                            <div className={styles.centerDesc}>{c.description}</div>
                          </div>

                          <div className={styles.centerActions}>
                            {c.telefone && (
                              <a
                                className={styles.smallBtn}
                                href={`tel:${c.telefone}`}
                                title="Ligar"
                              >
                                <Phone size={14} /> Ligar
                              </a>
                            )}
                            {c.email && (
                              <a
                                className={styles.smallBtn}
                                href={`mailto:${c.email}`}
                                title="Enviar email"
                              >
                                <Mail size={14} /> Email
                              </a>
                            )}
                            <button
                              className={styles.ghostBtn}
                              onClick={() => setSelectedCenter(c)}
                              title="Ver emergências deste centro"
                            >
                              Ver emergências
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={styles.empty}>Nenhum centro cadastrado.</div>
                  )}
                </>
              ) : (
                <div>
                  <button
                    className={styles.backButton}
                    onClick={() => setSelectedCenter(null)}
                  >
                    ← Voltar aos centros
                  </button>
                  <h4 className={styles.sectionTitle}>{selectedCenter.name}</h4>
                  <div className={styles.centerDetail}>
                    <div className={styles.centerDetailLeft}>
                      <div className={styles.centerAddrLarge}>
                        {selectedCenter.address}
                      </div>
                      <p className={styles.centerDesc}>{selectedCenter.description}</p>
                    </div>
                    <div className={styles.centerDetailRight}>
                      <div className={styles.sectionSubtitle}>Emergências vinculadas</div>
                      {mockEmergencies.filter((e) =>
                        e.helpingOrgs?.includes(selectedCenter.orgId || "")
                      ).length ? (
                        <ul className={styles.emergencyList}>
                          {mockEmergencies
                            .filter((e) =>
                              e.helpingOrgs?.includes(selectedCenter.orgId || "")
                            )
                            .map((em) => (
                              <li
                                key={em.id}
                                className={styles.emergencyItem}
                                onClick={() => setSelectedEmergency(em)}
                              >
                                <div className={styles.emTitle}>{em.title}</div>
                                <div className={styles.emStatus}>{em.status}</div>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <div className={styles.empty}>
                          Nenhuma emergência vinculada a este centro.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EMERGENCIES */}
          {activeTab === "emergencies" && (
            <div>
              {orgEmergencies.length ? (
                <ul className={styles.emergencyList}>
                  {orgEmergencies.map((e) => (
                    <li
                      key={e.id}
                      className={styles.emergencyItem}
                      onClick={() => setSelectedEmergency(e)}
                    >
                      <div>
                        <div className={styles.emTitle}>{e.title}</div>
                        <div className={styles.emDesc}>{e.description ?? ""}</div>
                      </div>
                      <div className={styles.emStatusBadge}>{e.status}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.empty}>Nenhuma emergência cadastrada.</div>
              )}

              {selectedEmergency && (
                <div className={styles.drawer}>
                  <button
                    className={styles.backButton}
                    onClick={() => setSelectedEmergency(null)}
                  >
                    ← Voltar
                  </button>
                  <h4 className={styles.sectionTitle}>{selectedEmergency.title}</h4>
                  <div className={styles.sectionText}>{selectedEmergency.description}</div>

                  <div className={styles.sectionSubtitle}>Demandas relacionadas</div>
                  {needs && needs.length ? (
                    <ul className={styles.needList}>
                      {needs
                        .filter((n) => n.emergencyId === selectedEmergency.id)
                        .map((n) => (
                          <li key={n.id} className={styles.needItem}>
                            <div className={styles.needTitle}>{n.title}</div>
                            <div className={styles.needQty}>{n.quantity ?? "—"}</div>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <div className={styles.empty}>Nenhuma demanda registrada.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* NEEDS */}
          {activeTab === "needs" && (
            <div>
              {orgNeeds.length ? (
                <ul className={styles.needList}>
                  {orgNeeds.map((n) => (
                    <li key={n.id} className={styles.needItem}>
                      <div className={styles.needTitle}>{n.title}</div>
                      <div className={styles.needMeta}>
                        {n.quantity ?? "—"} • {n.unit ?? ""}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.empty}>Nenhuma demanda disponível.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
