// app/components/CreateVolunteerModal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./createEmergency.module.css"; // usa o mesmo estilo do emergency
import type { Volunteer } from "@/app/mocks";
import api from "@/services/api";

type CreateVolunteerData = {
  name: string;
  email?: string;
  phone?: string;
  skills?: string;
  imageFile?: File | null;
  imagePreview?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (v: Volunteer) => void;
};

export default function CreateVolunteerModal({ open, onClose, onCreate }: Props) {
  const [form, setForm] = useState<CreateVolunteerData>({
    name: "",
    email: "",
    phone: "",
    skills: "",
    imageFile: null,
    imagePreview: null,
  });

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setForm({
        name: "",
        email: "",
        phone: "",
        skills: "",
        imageFile: null,
        imagePreview: null,
      });
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleOutsideClick(e: React.MouseEvent) {
    if (modalRef.current && e.target === modalRef.current) {
      onClose();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setForm((s) => ({ ...s, imageFile: f, imagePreview: url }));
  }

  function handleChange<K extends keyof CreateVolunteerData>(key: K, value: CreateVolunteerData[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function validate() {
    return form.name.trim().length > 2;
  }

  function handleSubmit(e?: React.FormEvent) {
    try {
        if (e) e.preventDefault();
        if (!validate()) {
        alert("Por favor preencha o nome (min 3 caracteres) e a descrição (min 7 caracteres).");
        return;
      }

      const newVolunteer: Volunteer = {
        id: `v${Date.now()}`,
        name: form.name.trim(),
        email: form.email?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        skills: form.skills?.trim() || undefined,
        image: form.imagePreview || undefined,
        createdAt: new Date().toISOString(),
      };
      
      api({
        url: '/api/v1/centros',
        method: 'POST',
        data: newVolunteer
      })

      onCreate(newVolunteer);
      onClose();
    } catch (error) {
      console.error("Error creating volunteer:", error);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.overlay} ref={modalRef} onMouseDown={handleOutsideClick} aria-modal="true" role="dialog">
      <div className={styles.modal} role="document" onMouseDown={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h3 className={styles.title}>Cadastrar Voluntário</h3>
          <button className={styles.close} onClick={onClose} aria-label="Fechar">✕</button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label className={styles.label}>Nome</label>
            <input
              ref={firstInputRef}
              className={styles.input}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nome do voluntário"
              required
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Email (opcional)</label>
            <input className={styles.input} value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="exemplo@email.com" />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Telefone (opcional)</label>
            <input className={styles.input} value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="(99) 99999-9999" />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Habilidades / Experiência (opcional)</label>
            <textarea className={styles.input} rows={3} value={form.skills} onChange={(e) => handleChange("skills", e.target.value)} placeholder="Ex: primeiros socorros, logística..." />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Imagem (opcional)</label>
            <div className={styles.fileRow}>
              <label className={styles.fileLabel}>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                Selecionar imagem
              </label>

              {form.imagePreview ? (
                <div className={styles.previewWrap}>
                  <img src={form.imagePreview} alt="Preview" className={styles.preview} />
                  <button type="button" className={styles.removePreview} onClick={() => setForm((s) => ({ ...s, imageFile: null, imagePreview: null }))}>Remover</button>
                </div>
              ) : null}
            </div>
          </div>

          <footer className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.primary}>Cadastrar</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
