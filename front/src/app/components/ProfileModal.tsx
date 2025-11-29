// src/components/ProfileModal.tsx
"use client";

import React, { useEffect } from "react";
import styles from "./profile-modal.module.css";
import { FiMail, FiPhone, FiX, FiCalendar, FiMapPin } from "react-icons/fi";
import { Organizacao } from "@/hooks/getVoluntarios";

export type ProfileShape = {
  nome: string;
  email?: string | null;
  phone?: string | null;
  organization?: string | null;
  organizacoes: Organizacao[];
  image?: string | null;
  createdAt?: string;
};

export default function ProfileModal({
  visible,
  onClose,
  profile,
}: {
  visible: boolean;
  onClose: () => void;
  profile?: ProfileShape | null;
}) {
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, onClose]);

  if (!visible || !profile) return null;

  const openMail = (email?: string | null) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };

  const openWhatsapp = (phone?: string | null) => {
    if (!phone) return;
    const digits = phone.replace(/\D+/g, "");
    const withCountry = digits.length <= 11 ? `55${digits}` : digits;
    const url = `https://wa.me/${withCountry}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };
  console.log(profile);
  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      onClick={onClose}
    >
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          aria-label="Fechar"
          onClick={onClose}
        >
          <FiX size={20} />
        </button>

        <div className={styles.avatarSection}>
          {profile.image ? (
            <img
              src={
                profile.image.startsWith("http")
                  ? profile.image
                  : `${process.env.API_URL}${profile.image}`
              }
              alt={profile.nome}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {profile.nome?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
          )}

          <h3 id="profile-modal-title" className={styles.name}>
            {profile.nome}
          </h3>

          {profile.createdAt && (
            <div className={styles.joinedDate}>
              <FiCalendar size={14} />
              <span>Membro desde {formatDate(profile.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Seção de Organizações */}
        {profile.organizacoes && profile.organizacoes.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <FiMapPin size={16} />
              Organizações
            </h4>
            <div className={styles.orgList}>
              {profile.organizacoes.map((org, index) => (
                <div key={index} className={styles.orgCard}>
                  {org.logo && (
                    <img
                      src={org.logo}
                      alt={org.name}
                      className={styles.orgLogo}
                    />
                  )}
                  <div className={styles.orgInfo}>
                    <div className={styles.orgName}>{org.name}</div>
                    {org.description && (
                      <div className={styles.orgDesc}>{org.description}</div>
                    )}
                    {org.website && (
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.orgLink}
                      >
                        Visitar site
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Contato */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Informações de Contato</h4>

          <div className={styles.contactInfo}>
            {profile.email && (
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <FiMail size={18} />
                </div>
                <div className={styles.contactDetails}>
                  <div className={styles.contactLabel}>Email</div>
                  <div className={styles.contactValue}>{profile.email}</div>
                </div>
              </div>
            )}

            {profile.phone && (
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <FiPhone size={18} />
                </div>
                <div className={styles.contactDetails}>
                  <div className={styles.contactLabel}>Telefone</div>
                  <div className={styles.contactValue}>{profile.phone}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botões de ação */}
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.emailBtn} ${!profile.email ? styles.disabled : ""}`}
            onClick={() => openMail(profile.email)}
            disabled={!profile.email}
            aria-disabled={!profile.email}
            title={
              profile.email
                ? `Enviar email para ${profile.email}`
                : "Email não disponível"
            }
          >
            <FiMail size={18} />
            <span>Enviar Email</span>
          </button>

          <button
            className={`${styles.actionBtn} ${styles.whatsappBtn} ${!profile.phone ? styles.disabled : ""}`}
            onClick={() => openWhatsapp(profile.phone)}
            disabled={!profile.phone}
            aria-disabled={!profile.phone}
            title={
              profile.phone
                ? `Abrir WhatsApp para ${profile.phone}`
                : "Telefone não disponível"
            }
          >
            <FiPhone size={18} />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
