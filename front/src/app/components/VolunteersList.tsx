// src/components/VolunteersList.tsx
"use client";

import React, { useEffect, useState } from "react";
import styles from "./volunteers.module.css";
import ProfileModal, { ProfileShape } from "./ProfileModal";
import { getAllVoluntarios, Usuario } from "@/hooks/getVoluntarios";

export default function VolunteersList() {
  const [localVolunteers, setLocalVolunteers] = useState<
    Usuario[] | undefined
  >();
  const [loading, setLoading] = useState(true);

  // modal state
  const [selectedProfile, setSelectedProfile] = useState<ProfileShape | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAllVoluntarios()
      .then((data) => {
        if (!mounted) return;
        setLocalVolunteers(data);
      })
      .catch((err) => {
        console.error("Falha ao buscar voluntários:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const openProfile = (v: Usuario) => {
    // map Usuario -> ProfileShape
    setSelectedProfile(v);
    setModalVisible(true);
  };

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h2 className={styles.title}>Voluntários</h2>
        <p className={styles.subtitle}>
          Lista de pessoas cadastradas como voluntários da sua ONG.
        </p>
      </header>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>Carregando voluntários...</div>
        ) : !localVolunteers || localVolunteers.length === 0 ? (
          <div className={styles.empty}>Nenhum voluntário encontrado.</div>
        ) : (
          localVolunteers.map((v) => (
            <article key={v._id} className={styles.card}>
              {/* Avatar clicável: abre modal */}
              <button
                className={styles.avatarButton}
                onClick={() => openProfile(v)}
                aria-label={`Ver perfil de ${v.nome}`}
                title={`Ver perfil de ${v.nome}`}
                type="button"
              >
                {v.image ? (
                  <img
                    src={
                      v.image.startsWith("http")
                        ? v.image
                        : `http://localhost:3001${v.image}`
                    }
                    alt={v.nome}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {v.nome?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                )}
              </button>

              <div className={styles.info}>
                <h3 className={styles.name}>{v.nome}</h3>
                <p className={styles.email}>{v.email ?? "—"}</p>
              </div>

              {/* removido botão "Ver perfil" conforme solicitado — deixei espaço para possíveis ações futuras */}
              <div style={{ width: 12 }} aria-hidden />
            </article>
          ))
        )}
      </div>

      <ProfileModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedProfile(null);
        }}
        profile={selectedProfile ?? undefined}
      />
    </section>
  );
}
