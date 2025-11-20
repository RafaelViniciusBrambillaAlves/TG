// src/components/ProfileModal.tsx
"use client";

import React, { useEffect } from "react";
import styles from "./profile-modal.module.css";
import { FiMail, FiPhone, FiX } from "react-icons/fi";

export type ProfileShape = {
  name: string;
  email?: string | null;
  phone?: string | null;
  organization?: string | null;
  image?: string | null;
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
  console.log(profile)
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

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" onClick={onClose}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h3 id="profile-modal-title" className={styles.headerTitle}>Perfil</h3>
          <button className={styles.closeBtn} aria-label="Fechar" onClick={onClose}><FiX size={18} /></button>
        </header>

        <div className={styles.avatarWrap}>
          {profile.image ? (
            <img src={`http://localhost:3001${profile.image}`} alt={profile.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>{profile.name?.charAt(0)?.toUpperCase() ?? "U"}</div>
          )}

          <div className={styles.meta}>
            <div className={styles.name}>{profile.name}</div>
            <div className={styles.org}>{profile.organization ?? "Organização não informada"}</div>
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Email</div>
            <div className={styles.infoValue}>{profile.email ?? "—"}</div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Telefone</div>
            <div className={styles.infoValue}>{profile.phone ?? "—"}</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${!profile.email ? styles.disabled : ""}`}
            onClick={() => openMail(profile.email)}
            disabled={!profile.email}
            aria-disabled={!profile.email}
          >
            <FiMail /> <span>Email</span>
          </button>

          <button
            className={`${styles.actionBtn} ${!profile.phone ? styles.disabled : ""}`}
            onClick={() => openWhatsapp(profile.phone)}
            disabled={!profile.phone}
            aria-disabled={!profile.phone}
          >
            <FiPhone /> <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
