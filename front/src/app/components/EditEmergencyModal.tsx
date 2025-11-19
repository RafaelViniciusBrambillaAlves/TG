// app/components/EditEmergencyModal.tsx
"use client";

import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import styles from "./createEmergency.module.css";
import type { Emergency } from "@/app/mocks";

type Props = {
  open: boolean;
  emergency: Emergency | null;
  onClose: () => void;
  onUpdate: (e: Emergency) => void;
};

export default function EditEmergencyModal({ open, emergency, onClose, onUpdate }: Props) {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    address: "",
    image: "" as string | null,
    status: "Aberta" as Emergency["status"],
  });
  const firstRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && emergency) {
      setForm({
        title: emergency.title || "",
        subtitle: emergency.subtitle || "",
        description: emergency.description || "",
        address: emergency.address || "",
        image: emergency.image || null,
        status: emergency.status || "Aberta",
      });
      setTimeout(() => firstRef.current?.focus(), 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, emergency]);

  if (!open || !emergency) return null;

  function handleChange<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setForm((s) => ({ ...s, imagePreview: url }));
  }

  function handleRemoveImage() {
    setForm((s) => ({ ...s, imagePreview: null }));
  }

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (form.title.trim().length < 4 || form.description.trim().length < 7) {
      alert("Título (min 4) e descrição (min 7).");
      return;
    }
    const updated: Emergency = {
      ...emergency,
      title: form.title.trim(),
      subtitle: form.subtitle?.trim() || undefined,
      description: form.description.trim(),
      address: form.address?.trim() || undefined,
      image: form.image || undefined,
      status: form.status,
      // createdAt, id, authorName remain unchanged
    };
    onUpdate(updated);
    onClose();
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h3 className={styles.title}>Editar emergência</h3>
          <button className={styles.close} onClick={onClose} aria-label="Fechar">✕</button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label className={styles.label}>Título</label>
            <input
              ref={firstRef}
              className={styles.input}
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Subtítulo (opcional)</label>
            <input className={styles.input} value={form.subtitle} onChange={(e) => handleChange("subtitle", e.target.value)} />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Descrição</label>
            <textarea className={styles.input} rows={4} value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
          </div>

          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Endereço</label>
              <input className={styles.input} value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
            </div>
            <div>
              <label className={styles.label}>Status</label>
              <select className={styles.input} value={form.status} onChange={(e) => handleChange("status", e.target.value as any)}>
                <option value="Aberta">Aberta</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Fechada">Fechada</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Imagem (opcional)</label>
            <div className={styles.fileRow}>
              <label className={styles.fileLabel}>
                <input type="file" accept="image/*" onChange={handleImage} />
                Selecionar imagem
              </label>

              {form.image ? (
                <div className={styles.previewWrap}>
                  <img src={`http://localhost:3001${form.image}`} alt="Preview" className={styles.preview} />
                  <button type="button" className={styles.removePreview} onClick={handleRemoveImage}>Remover</button>
                </div>
              ) : null}
            </div>
          </div>

          <footer className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.primary}>Salvar alterações</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
