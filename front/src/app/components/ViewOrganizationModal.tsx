"use client";

import React, { useState } from "react";
import styles from "./organizationModal.module.css";
import { ONG, Center, Emergency, Need } from "@/app/mocks";
import { X, Instagram, Twitter, Phone, Globe, Mail } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  org: ONG;
  centers?: Center[];
  emergencies?: Emergency[];
  needs?: Need[];
};

export default function ViewOrganizationModal({
  open,
  onClose,
  org,
  centers = [],
  emergencies = [],
  needs = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<"centers" | "emergencies">("centers");
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);

  if (!open) return null;

  // 🔹 MOCK extra só para visualização
  const mockCenters = centers.length
    ? centers
    : [
        {
          id: "c1",
          name: "Centro Esperança",
          address: "Rua das Flores, 123 - São Paulo",
          description: "Oferece suporte alimentar e psicológico para famílias em vulnerabilidade.",
          orgId: org.id,
        },
        {
          id: "c2",
          name: "Centro Vida Nova",
          address: "Av. Central, 456 - Rio de Janeiro",
          description: "Atendimento médico e triagem social para pessoas em situação de rua.",
          orgId: org.id,
        },
      ];

  const mockEmergencies = emergencies.length
    ? emergencies
    : [
        {
          id: "e1",
          title: "Enchentes em São Paulo",
          status: "Ativa",
          helpingOrgs: [org.id],
        },
        {
          id: "e2",
          title: "Campanha de Doação de Agasalhos",
          status: "Concluída",
          helpingOrgs: [org.id],
        },
      ];

  const orgCenters = mockCenters.filter((c) => c.orgId === org.id);
  const orgEmergencies = mockEmergencies.filter((e) => e.helpingOrgs?.includes(org.id));

  const centerEmergencies = selectedCenter
    ? mockEmergencies.filter((e) => e.helpingOrgs?.includes(selectedCenter.orgId || ""))
    : [];

  const emergencyNeeds = selectedEmergency
    ? needs.filter((n) => n.emergencyId === selectedEmergency.id)
    : [];

  const NoDataMessage = ({ text }: { text: string }) => (
    <p className={styles.noCenters}>{text}</p>
  );

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <img src={org.logo} alt={org.name} className={styles.logo} />
            <div>
              <h2 className={styles.name}>{org.name}</h2>
              <p className={styles.type}>Organização Social</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.close}>
            <X size={18} />
          </button>
        </div>

        {/* Contato */}
        <div className={styles.contactInfo}>
          {org.phone && (
            <div>
              <Phone size={16} /> <a href={`tel:${org.phone}`}>{org.phone}</a>
            </div>
          )}
          {org.email && (
            <div>
              <Mail size={16} /> <a href={`mailto:${org.email}`}>{org.email}</a>
            </div>
          )}
          {org.website && (
            <div>
              <Globe size={16} />{" "}
              <a href={org.website} target="_blank">
                {org.website}
              </a>
            </div>
          )}
        </div>

        {/* Descrição */}
        <p className={styles.description}>{org.description}</p>

        {/* Redes sociais */}
        <div className={styles.socials}>
          {org.instagram && (
            <a href={org.instagram} target="_blank" className={styles.icon}>
              <Instagram size={18} />
            </a>
          )}
          {org.twitter && (
            <a href={org.twitter} target="_blank" className={styles.icon}>
              <Twitter size={18} />
            </a>
          )}
          {org.phone && (
            <a href={`tel:${org.phone}`} className={styles.icon}>
              <Phone size={18} />
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={activeTab === "centers" ? styles.activeTab : ""}
            onClick={() => {
              setActiveTab("centers");
              setSelectedCenter(null);
              setSelectedEmergency(null);
            }}
          >
            Centros
          </button>
          <button
            className={activeTab === "emergencies" ? styles.activeTab : ""}
            onClick={() => {
              setActiveTab("emergencies");
              setSelectedCenter(null);
              setSelectedEmergency(null);
            }}
          >
            Emergências
          </button>
        </div>

        {/* CENTROS */}
        {activeTab === "centers" && (
          <div className={styles.tabContent}>
            {!selectedCenter ? (
              orgCenters.length > 0 ? (
                <ul className={styles.centerList}>
                  {orgCenters.map((c) => (
                    <li key={c.id} className={styles.centerItem} onClick={() => setSelectedCenter(c)}>
                      <div className={styles.centerHeader}>
                        <div className={styles.centerName}>{c.name}</div>
                        <div className={styles.centerCity}>{c.address}</div>
                      </div>
                      <p className={styles.centerDesc}>{c.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <NoDataMessage text="Nenhum centro cadastrado para esta organização." />
              )
            ) : (
              <div>
                <button className={styles.backButton} onClick={() => setSelectedCenter(null)}>
                  ← Voltar aos Centros
                </button>
                <h4>Emergências deste centro</h4>
                {centerEmergencies.length > 0 ? (
                  <ul className={styles.emergencyList}>
                    {centerEmergencies.map((e) => (
                      <li key={e.id} className={styles.emergencyItem} onClick={() => setSelectedEmergency(e)}>
                        <strong>{e.title}</strong> — {e.status}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <NoDataMessage text="Nenhuma emergência vinculada a este centro." />
                )}
              </div>
            )}
          </div>
        )}

        {/* EMERGÊNCIAS */}
        {activeTab === "emergencies" && (
          <div className={styles.tabContent}>
            {orgEmergencies.length > 0 ? (
              <ul className={styles.emergencyList}>
                {orgEmergencies.map((e) => (
                  <li key={e.id} className={styles.emergencyItem} onClick={() => setSelectedEmergency(e)}>
                    <strong>{e.title}</strong> — {e.status}
                  </li>
                ))}
              </ul>
            ) : (
              <NoDataMessage text="Nenhuma emergência cadastrada para esta organização." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
