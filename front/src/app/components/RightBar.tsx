"use client";

import React, { useEffect, useState } from "react";
import styles from "./rightbar.module.css";
import { ONG } from "@/app/mocks";

type Props = {
  org?: ONG;
  showRegister?: boolean;
  onRegisterClick?: () => void;
  registerLabel?: string;
};

export default function RightBar({
  org,
  showRegister = false,
  onRegisterClick,
  registerLabel = "Cadastrar centro",
}: Props) {
  const [currentOrg, setCurrentOrg] = useState<ONG[]>();

  useEffect(() => {
    setCurrentOrg(JSON.parse(localStorage.getItem("usuario"))?.organizations);
  }, []);

  return (
    <aside className={styles.card} aria-label="Informações da organização">
      <div className={styles.content}>
        <div className={styles.row}>
          {currentOrg?.[0]?.logo ? (
            <img
              src={currentOrg[0].logo}
              alt={currentOrg[0].name}
              className={styles.logo}
            />
          ) : (
            <div className={styles.logoPlaceholder}>
              {currentOrg?.[0]?.name[0]}
            </div>
          )}
          <div>
            <div className={styles.name}>{currentOrg?.[0]?.name}</div>
          </div>
        </div>

        <p className={styles.desc}>{currentOrg?.[0]?.description}</p>

        {currentOrg?.[0] &&
          <button
            className={styles.button}
            type="button"
            onClick={() => {
              // 🔧 Dispara evento global capturado no Page.tsx
              window.dispatchEvent(
                new CustomEvent("view-org", { detail: currentOrg?.[0] }),
              );
            }}
          >
            Ver Organização
          </button>
        }

        {showRegister && (
          <div style={{ marginTop: 12 }}>
            <button
              className={styles.registerButton}
              type="button"
              onClick={() => onRegisterClick?.()}
            >
              {registerLabel}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
