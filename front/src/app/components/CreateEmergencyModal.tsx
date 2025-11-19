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

  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // cleanup preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (form.imagePreview) {
        try {
          URL.revokeObjectURL(form.imagePreview);
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // revoke preview URL if present
      if (form.imagePreview) {
        try {
          URL.revokeObjectURL(form.imagePreview);
        } catch {}
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    // tamanho máximo client-side (8MB)
    const MAX = 8 * 1024 * 1024;
    if (f.size > MAX) {
      alert("Arquivo muito grande. Tamanho máximo: 8MB.");
      e.currentTarget.value = "";
      return;
    }

    // revoga preview anterior se houver
    if (form.imagePreview) {
      try {
        URL.revokeObjectURL(form.imagePreview);
      } catch {}
    }

    const url = URL.createObjectURL(f);
    setForm((s) => ({ ...s, imageFile: f, imagePreview: url }));
  }

  function handleChange<K extends keyof CreateEmergencyData>(
    key: K,
    value: CreateEmergencyData[K]
  ) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function validate() {
    return form.title.trim().length > 3 && form.description.trim().length > 6;
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    // se sua api requer autenticação, o axios instance `api` pode já ter Authorization setado
    const res = await api.post("/api/v1/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      // optional: onUploadProgress: (progressEvent) => { /* mostrar progresso */ }
    });

    // aceita várias formas de resposta do backend
    const data = res.data ?? {};
    if (typeof data === "string") {
      // se backend retorna string com id ou url
      return data;
    }
    if (data.url) return data.url;
    if (data.fileId) return `/api/v1/files/${data.fileId}`;
    if (data.file?._id) return `/api/v1/files/${data.file._id}`;
    // fallback: procurar id em data._id
    if (data._id) return `/api/v1/files/${data._id}`;

    throw new Error("Resposta de upload inválida");
  }

  async function handleSubmit(e?: React.FormEvent) {
    try {
      if (e) e.preventDefault();
      if (!validate()) {
        alert(
          "Por favor preencha o título (min 4 caracteres) e a descrição (min 7 caracteres)."
        );
        return;
      }

      setLoading(true);

      // 1) se tiver arquivo, fazer upload primeiro
      let imageUrl: string | undefined = undefined;
      if (form.imageFile) {
        try {
          imageUrl = await uploadFile(form.imageFile);
        } catch (err) {
          console.error("Erro ao enviar imagem:", err);
          alert("Falha ao enviar a imagem. Tente novamente.");
          setLoading(false);
          return;
        }
      } else if (form.imagePreview) {
        // se houver preview sem arquivo (hipotético), não usamos — preferimos undefined
        imageUrl = form.imagePreview;
      }

      // 2) montar payload e enviar criação da emergência
      const payload: Partial<Emergencia> = {
        titulo: form.title.trim(),
        subtitulo: form.subtitle?.trim() || undefined,
        descricao: form.description.trim(),
        address: form.address?.trim() || undefined,
        image: imageUrl || undefined,
        status: form.status,
      };

      const res = await api.post("/api/v1/emergencias/emergencias", payload);

      // opcional: você pode extrair o objeto criado se o backend retornar
      const createdFromServer: any = res?.data ?? null;

      // notifica parent (signature atual não espera o objeto)
      onCreate();

      // revoga preview URL (limpeza)
      if (form.imagePreview) {
        try {
          URL.revokeObjectURL(form.imagePreview);
        } catch {}
      }

      onClose();
    } catch (error) {
      console.error("Error creating emergency:", error);
      alert("Ocorreu um erro ao criar a emergência. Tente novamente.");
    } finally {
      setLoading(false);
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
            type="button"
            disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Subtítulo (opcional)</label>
            <input
              className={styles.input}
              value={form.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              placeholder="Subtítulo breve"
              disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
              />
            </div>
            <div>
              <label className={styles.label}>Status</label>
              <select
                className={styles.input}
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value as any)}
                disabled={loading}
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
                  disabled={loading}
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
                      setForm((s) => {
                        // revoke previous preview
                        if (s.imagePreview) {
                          try {
                            URL.revokeObjectURL(s.imagePreview);
                          } catch {}
                        }
                        return { ...s, imageFile: null, imagePreview: null };
                      })
                    }
                    disabled={loading}
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
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.primary} disabled={loading}>
              {loading ? "Enviando..." : "Criar emergência"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
