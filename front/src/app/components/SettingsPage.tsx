"use client";

import React, { useEffect, useState } from "react";
import styles from "./settingsPage.module.css";
import { MOCK_ONGS } from "@/app/mocks";

const STORAGE_KEY = "app_settings_v2";

type SettingsState = {
  profilePublic: boolean;
  language: string;
  timezone: string;
  associatedOrgId?: string;
};

const DEFAULT_SETTINGS: SettingsState = {
  profilePublic: true,
  language: "pt-BR",
  timezone: "America/Sao_Paulo",
  associatedOrgId: "o1",
};

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: SettingsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [editing, setEditing] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const org = MOCK_ONGS.find((o) => o.id === settings.associatedOrgId) ?? null;

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setEditing(true);
  }

  function handleSave() {
    saveSettings(settings);
    setEditing(false);
    setSavedAt(new Date().toLocaleString());
  }

  function handleCancel() {
    setSettings(loadSettings());
    setEditing(false);
  }

  function handleResetDefaults() {
    setSettings(DEFAULT_SETTINGS);
    setEditing(true);
  }

  function handleDeleteAccount() {
    if (!confirm("Tem certeza que deseja excluir sua conta? Essa ação é irreversível.")) return;
    localStorage.removeItem(STORAGE_KEY);
    alert("Conta excluída (mock). Configurações removidas.");
  }

  return (
    <div className={styles.pageWrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Configurações</h1>
          <p className={styles.subtitle}>Ajuste suas preferências de privacidade, idioma e conta.</p>
        </div>

        <div className={styles.headerActions}>
          {editing ? (
            <>
              <button className={`${styles.btn} ${styles.primary}`} onClick={handleSave}>
                Salvar
              </button>
              <button className={`${styles.btn} ${styles.secondary}`} onClick={handleCancel}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button className={`${styles.btn} ${styles.outline}`} onClick={() => setEditing(true)}>
                Editar
              </button>
              <button className={`${styles.btn} ${styles.ghost}`} onClick={handleResetDefaults}>
                Restaurar padrão
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Associação */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Associação</h2>
          <div className={styles.valueBox}>
            <div>
              <div className={styles.orgName}>{org?.name ?? "Nenhuma associação"}</div>
              <div className={styles.orgMeta}>{org?.email ?? ""}</div>
            </div>
          </div>
        </section>

        {/* Preferências */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Preferências</h2>

          <label className={styles.field}>
            <div className={styles.label}>Visibilidade do perfil</div>
            <div className={styles.hint}>Controla se seu perfil será público ou privado.</div>
            <div className={styles.selectRow}>
              <select
                value={settings.profilePublic ? "public" : "private"}
                onChange={(e) => update("profilePublic", e.target.value === "public")}
                disabled={!editing}
              >
                <option value="public">Público</option>
                <option value="private">Privado</option>
              </select>
            </div>
          </label>

          <label className={styles.field}>
            <div className={styles.label}>Idioma</div>
            <div className={styles.selectRow}>
              <select
                value={settings.language}
                onChange={(e) => update("language", e.target.value)}
                disabled={!editing}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español (ES)</option>
              </select>
            </div>
          </label>

          <label className={styles.field}>
            <div className={styles.label}>Fuso horário</div>
            <div className={styles.selectRow}>
              <select
                value={settings.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                disabled={!editing}
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
                <option value="America/New_York">America/New_York (GMT-3/-4)</option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
              </select>
            </div>
          </label>
        </section>

        {/* Conta */}
        <section className={styles.card}>
          <div className={styles.deleteZone}>
            <div className={styles.deleteInfo}>
              <div className={styles.deleteTitle}>Excluir conta</div>
              <div className={styles.hint}>Remover permanentemente sua conta e todos os dados associados.</div>
            </div>
            <button className={`${styles.btn} ${styles.danger}`} onClick={handleDeleteAccount}>
              Excluir conta
            </button>
          </div>

          <div className={styles.saveMeta}>
            {savedAt ? <span>Última salvaguarda: {savedAt}</span> : <span>Sem alterações salvas</span>}
          </div>
        </section>
      </div>
    </div>
  );
}
