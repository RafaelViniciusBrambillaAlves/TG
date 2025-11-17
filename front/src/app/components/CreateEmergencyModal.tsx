// app/components/CreateEmergencyModal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./createEmergency.module.css";
import type { Emergency } from "@/app/mocks";
import { Emergencia } from "@/hooks/getEmergencias";
import api from "@/services/api";

type CreateEmergencyData = {
  title: string;
  subtitle?: string;
  description: string;
  address?: string;
  imageFile?: File | null;
  imagePreview?: string | null;
  status?: "Aberta" | "Em andamento" | "Fechada";
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
};

export default function CreateEmergencyModal({
  open,
  onClose,
  onCreate,
}: Props) {
  const [form, setForm] = useState<CreateEmergencyData>({
    title: "",
    subtitle: "",
    description: "",
    address: "",
    imageFile: null,
    imagePreview: null,
    status: "Aberta",
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
        title: "",
        subtitle: "",
        description: "",
        address: "",
        imageFile: null,
        imagePreview: null,
        status: "Aberta",
      });
    }
    return () => {
      document.body.style.overflow = "";
    };
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

  function handleChange<K extends keyof CreateEmergencyData>(
    key: K,
    value: CreateEmergencyData[K],
  ) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function validate() {
    return form.title.trim().length > 3 && form.description.trim().length > 6;
  }

  async function handleSubmit(e?: React.FormEvent) {
    try {
      if (e) e.preventDefault();
      if (!validate()) {
        alert(
          "Por favor preencha o nome (min 3 caracteres) e a descrição (min 7 caracteres).",
        );
        return;
      }

      // monta payload a ser enviado
      const payload: Partial<Emergencia> = {
        titulo: form.title.trim(),
        subtitulo: form.subtitle?.trim() || undefined,
        descricao: form.description.trim(),
        address: form.address?.trim() || undefined,
        image: form.imagePreview || undefined,
        status: form.status,
      };

      // chama API e aguarda resposta
      const res = await api({
        url: "/api/v1/emergencias/emergencias",
        method: "POST",
        data: payload,
      });

      // tenta extrair o objeto criado vindo do servidor
      const createdFromServer: any = res?.data ?? null;

      // se servidor não retornar o objeto completo, cria um fallback local
      const created: Emergencia = {
        // usa campos esperados; prefira a resposta do servidor quando disponível
        _id:
          createdFromServer?._id ??
          createdFromServer?.id ??
          `temp-${Date.now()}`, // id temporário se necessário
        titulo: createdFromServer?.titulo ?? payload.titulo!,
        subtitulo: createdFromServer?.subtitulo ?? payload.subtitulo,
        descricao: createdFromServer?.descricao ?? payload.descricao!,
        address: createdFromServer?.address ?? payload.address,
        image: createdFromServer?.image ?? payload.image,
        status: createdFromServer?.status ?? payload.status ?? "Aberta",
        // se o backend usar outro campo para data, normalize para data_inicio (opcional)
        data_inicio:
          createdFromServer?.data_inicio ??
          createdFromServer?.createdAt ??
          new Date().toISOString(),
        // outros campos que você espera podem ser mesclados:
        ...(createdFromServer ?? {}),
      };

      // notifica o parent com o objeto criado (servidor > fallback)
      onCreate();

      // fecha modal
      onClose();
    } catch (error) {
      console.error("Error creating emergency:", error);
      alert("Ocorreu um erro ao criar a emergência. Tente novamente.");
    }
  }

  if (!open) return null;

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
          <h3 className={styles.title}>Criar emergência</h3>
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
            <label className={styles.label}>Título</label>
            <input
              ref={firstInputRef}
              className={styles.input}
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Título da emergência"
              required
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Subtítulo (opcional)</label>
            <input
              className={styles.input}
              value={form.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              placeholder="Subtítulo breve"
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Descrição</label>
            <textarea
              className={styles.input}
              rows={4}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Detalhes da emergência"
              required
            />
          </div>

          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Endereço</label>
              <input
                className={styles.input}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Rua, número, bairro"
              />
            </div>
            <div>
              <label className={styles.label}>Status</label>
              <select
                className={styles.input}
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value as any)}
              >
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                Selecionar imagem
              </label>

              {form.imagePreview ? (
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
              ) : null}
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
              Criar emergência
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
