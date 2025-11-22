// app/components/EditEmergencyModal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./createEmergency.module.css";
import type { Emergency } from "@/app/mocks";
import { Emergencia } from "@/hooks/getEmergencias";
import api from "@/services/api";

type Props = {
  open: boolean;
  emergency: Emergencia;
  onClose: () => void;
  onUpdate: (e: Emergencia) => void;
};

type FormState = {
  title: string;
  subtitle: string;
  description: string;
  address: string;
  status: Emergency["status"];
  // imagem já salva no backend (ex.: "/api/v1/files/xxxx")
  existingImagePath: string | null;
  // arquivo selecionado pelo usuário (novo)
  selectedFile: File | null;
  // URL temporária para preview do arquivo novo
  previewUrl: string | null;
};

const API_BASE =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  "http://localhost:3001";

export default function EditEmergencyModal({ open, emergency, onClose, onUpdate }: Props) {
  const [form, setForm] = useState<FormState>({
    title: "",
    subtitle: "",
    description: "",
    address: "",
    status: "Aberta" as Emergency["status"],
    existingImagePath: null,
    selectedFile: null,
    previewUrl: null,
  });

  const firstRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && emergency) {
      setForm({
        title: emergency.titulo || "",
        subtitle: emergency.subtitulo || "",
        description: emergency.descricao || "",
        address: (emergency as any).address || "", // compat se Emergencia não tiver 'address'
        status: (emergency.status as Emergency["status"]) || "Aberta",
        existingImagePath: emergency.image || null,
        selectedFile: null,
        previewUrl: null,
      });

      setTimeout(() => firstRef.current?.focus(), 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, emergency]);

  // Evitar vazamento de URL de preview
  useEffect(() => {
    return () => {
      if (form.previewUrl) {
        try {
          URL.revokeObjectURL(form.previewUrl);
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!open || !emergency) return null;

  function handleChange<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    // tamanho máximo client-side (8MB)
    const MAX = 8 * 1024 * 1024;
    if (f.size > MAX) {
      alert("Arquivo muito grande. Tamanho máximo: 8MB.");
      e.currentTarget.value = "";
      return;
    }

    if (form.previewUrl) {
      try {
        URL.revokeObjectURL(form.previewUrl);
      } catch {}
    }

    const url = URL.createObjectURL(f);
    setForm((s) => ({
      ...s,
      selectedFile: f,
      previewUrl: url,
      // mantém existingImagePath (não mexe) — a imagem antiga só sai se clicar "Remover"
    }));
  }

  function handleRemoveImage() {
    // Remove a imagem inteiramente (tanto nova quanto existente)
    if (form.previewUrl) {
      try {
        URL.revokeObjectURL(form.previewUrl);
      } catch {}
    }
    setForm((s) => ({
      ...s,
      selectedFile: null,
      previewUrl: null,
      existingImagePath: null,
    }));
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/api/v1/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const data = res.data ?? {};
    if (typeof data === "string") return data;
    if (data.url) return data.url;
    if (data.fileId) return `/api/v1/files/${data.fileId}`;
    if (data.file?._id) return `/api/v1/files/${data.file._id}`;
    if (data._id) return `/api/v1/files/${data._id}`;

    throw new Error("Resposta de upload inválida");
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (form.title.trim().length < 4 || form.description.trim().length < 7) {
      alert("Título (min 4) e descrição (min 7).");
      return;
    }

    // Mantém a imagem atual por padrão
    let imagePath: string | undefined = form.existingImagePath ?? undefined;

    // Só faz upload se o usuário selecionou um novo arquivo
    if (form.selectedFile) {
      try {
        imagePath = await uploadFile(form.selectedFile);
      } catch (err) {
        console.error("Erro ao enviar imagem:", err);
        alert("Falha ao enviar a imagem. Tente novamente.");
        return;
      }
    }

    const updated: Emergency = {
      ...(emergency as any),
      titulo: form.title.trim(),
      subtitulo: form.subtitle?.trim() || undefined,
      descricao: form.description.trim(),
      address: form.address?.trim() || undefined,
      image: imagePath,
      status: form.status,
    };

    await api.put(`/api/v1/emergencias/emergencias/${(emergency as any)._id}`, updated as any);
    onUpdate(updated as any);
    onClose();
  }

  // Define a imagem a ser exibida:
  // - Se o usuário selecionou um novo arquivo => usa o previewUrl
  // - Senão, se tem imagem existente => prefixa o host quando necessário
  const previewSrc =
    form.selectedFile && form.previewUrl
      ? form.previewUrl
      : form.existingImagePath
      ? form.existingImagePath.startsWith("http")
        ? form.existingImagePath
        : `${API_BASE}${form.existingImagePath}`
      : null;

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
          <button className={styles.close} onClick={onClose} aria-label="Fechar">
            ✕
          </button>
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
            <input
              className={styles.input}
              value={form.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Descrição</label>
            <textarea
              className={styles.input}
              rows={4}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Endereço</label>
              <input
                className={styles.input}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
            <div>
              <label className={styles.label}>Status</label>
              <select
                className={styles.input}
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value as FormState["status"])}
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
                <input type="file" accept="image/*" onChange={handleFileChange} />
                Selecionar imagem
              </label>

              {previewSrc ? (
                <div className={styles.previewWrap}>
                  <img src={previewSrc} alt="Preview" className={styles.preview} />
                  <button
                    type="button"
                    className={styles.removePreview}
                    onClick={handleRemoveImage}
                  >
                    Remover
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <footer className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={onClose}>
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
