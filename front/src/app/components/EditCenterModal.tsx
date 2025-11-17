"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./createcenter.module.css";
import type { Center } from "@/app/mocks";

type EditCenterData = {
  nome: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  imageFile?: File | null;
  imagePreview?: string | null;
};

type Props = {
  open: boolean;
  center: Center | null;
  onClose: () => void;
  onUpdate: (updated: Center) => void;
};

export default function EditCenterModal({
  open,
  center,
  onClose,
  onUpdate,
}: Props) {
  const [form, setForm] = useState<EditCenterData>({
    nome: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    imageFile: null,
    imagePreview: null,
  });

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && center) {
      setForm({
        nome: center.nome,
        description: center.description,
        phone: center.phone || "",
        email: center.email || "",
        address: center.address || "",
        imageFile: null,
        imagePreview: center.image || null,
      });
      setTimeout(() => firstInputRef.current?.focus(), 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, center]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleOutsideClick(e: React.MouseEvent) {
    if (modalRef.current && e.target === modalRef.current) onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setForm((s) => ({ ...s, imageFile: f, imagePreview: url }));
  }

  function handleChange<K extends keyof EditCenterData>(
    key: K,
    value: EditCenterData[K],
  ) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function validate() {
    return form.nome.trim().length > 2 && form.description.trim().length > 6;
  }

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!validate() || !center) {
      alert(
        "Por favor preencha o nome (min 3 caracteres) e a descrição (min 7 caracteres).",
      );
      return;
    }

    const updatedCenter = {
      ...center,
      name: form.nome.trim(),
      description: form.description.trim(),
      phone: form.phone?.trim() || undefined,
      email: form.email?.trim() || undefined,
      address: form.address?.trim() || undefined,
      image: form.imagePreview || undefined,
    };

    onUpdate(updatedCenter);
    onClose();
  }

  if (!open || !center) return null;

  return (
    <div
      className={styles.overlay}
      ref={modalRef}
      onMouseDown={handleOutsideClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={styles.modal}
        role="document"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h3 className={styles.title}>Editar centro</h3>
          <button
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label className={styles.label}>Nome</label>
            <input
              className={styles.input}
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              placeholder="Nome do centro"
              required
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Descrição</label>
            <textarea
              className={styles.input}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Uma breve descrição do centro"
              rows={3}
              required
            />
          </div>

          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Telefone</label>
              <input
                className={styles.input}
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+55 11 9..."
              />
            </div>
            <div>
              <label className={styles.label}>E-mail</label>
              <input
                className={styles.input}
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="contato@exemplo.org"
              />
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Endereço</label>
            <input
              className={styles.input}
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Rua, número, bairro"
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Imagem (opcional)</label>
            <div className={styles.fileRow}>
              <label className={styles.fileLabel}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                Selecionar imagem
              </label>

              {form.imagePreview && (
                <div className={styles.previewWrap}>
                  <img
                    src={form.imagePreview}
                    alt="Preview"
                    className={styles.preview}
                  />
                  <button
                    type="button"
                    className={styles.removePreview}
                    onClick={() =>
                      setForm((s) => ({
                        ...s,
                        imageFile: null,
                        imagePreview: null,
                      }))
                    }
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          </div>

          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.primary}>
              Salvar alterações
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
