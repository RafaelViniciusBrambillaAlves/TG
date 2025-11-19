"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./createcenter.module.css";
import type { Center } from "@/app/mocks";
import api from "@/services/api";

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

  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // sempre revoga previews antigos ao desmontar
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

  // quando modal abrir com center, preenche o formulário
  useEffect(() => {
    if (open && center) {
      setForm({
        nome: // fallback entre 'nome' e 'name'
          // @ts-ignore
          center.nome ?? // prefer 'nome'
          // @ts-ignore
          center.name ?? "",
        description:
          // @ts-ignore
          center.description ?? // prefer 'description'
          // @ts-ignore
          center.descricao ?? "",
        phone:
          // @ts-ignore
          center.phone ?? // prefer 'phone'
          // @ts-ignore
          center.telefone ?? "",
        email:
          // @ts-ignore
          center.email ?? "",
        address:
          // @ts-ignore
          center.address ?? "",
        imageFile: null,
        // mostra a imagem atual se existir (pode ser url relativa)
        imagePreview:
          // @ts-ignore
          'http://localhost:3001'+`${center.image}` ?? null,
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
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    // limite client-side (8MB)
    const MAX = 8 * 1024 * 1024;
    if (f.size > MAX) {
      alert("Arquivo muito grande. Tamanho máximo: 8MB.");
      e.currentTarget.value = "";
      return;
    }

    // revoga preview anterior
    if (form.imagePreview) {
      try {
        URL.revokeObjectURL(form.imagePreview);
      } catch {}
    }

    const url = URL.createObjectURL(f);
    setForm((s) => ({ ...s, imageFile: f, imagePreview: url }));
  }

  function handleChange<K extends keyof EditCenterData>(key: K, value: EditCenterData[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function validate() {
    return form.nome.trim().length > 2 && form.description.trim().length > 6;
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
    try {
      if (e) e.preventDefault();
      if (!validate() || !center) {
        alert(
          "Por favor preencha o nome (min 3 caracteres) e a descrição (min 7 caracteres).",
        );
        return;
      }

      setLoading(true);

      // 1) se trocou a imagem, faz upload e obtém url
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
      } else {
        // se não enviou novo arquivo, mantemos o preview atual (que pode ser url já salva)
        imageUrl = form.imagePreview ?? undefined;
      }

      // 2) montar objeto atualizado (mantém chaves originais de center)
      const updatedCenter: Center = {
        // copia campos existentes — spread garante que preenchimentos não descritos persitam
        // @ts-ignore
        ...center,
        // sobrescreve campos editáveis
        // mantemos o mesmo formato de campo do objeto original (nome, description, phone, email, address, image)
        // usamos trimmed values
        // @ts-ignore
        nome: form.nome.trim(),
        // @ts-ignore
        description: form.description.trim(),
        // @ts-ignore
        phone: form.phone?.trim() || undefined,
        // @ts-ignore
        email: form.email?.trim() || undefined,
        // @ts-ignore
        address: form.address?.trim() || undefined,
        // @ts-ignore
        image: imageUrl || undefined,
      };

      // 3) tenta enviar update ao backend se houver _id
      let serverUpdated: any = null;
      // @ts-ignore
      const id = (center as any)?._id ?? (center as any)?.id;
      if (id) {
        try {
          // tenta PUT; se sua API usar PATCH, altere para .patch
          const res = await api.put(`/api/v1/centros/${id}`, updatedCenter);
          serverUpdated = res.data ?? null;
        } catch (err) {
          console.warn("Falha ao atualizar no servidor, atualizando localmente:", err);
          // não retorna — vamos atualizar localmente mesmo assim
        }
      }

      // 4) preferir a resposta do servidor caso exista, senão usar updatedCenter
      const finalCenter: Center = serverUpdated
        ? // merge servidor com o objeto local (servidor tem prioridade)
          {
            // @ts-ignore
            ...updatedCenter,
            ...(typeof serverUpdated === "object" ? serverUpdated : {}),
          }
        : updatedCenter;

      // 5) revoga preview se houver (limpeza)
      if (form.imagePreview && form.imageFile) {
        try {
          URL.revokeObjectURL(form.imagePreview);
        } catch {}
      }

      // 6) notifica parent
      onUpdate(finalCenter);
      onClose();
    } catch (error) {
      console.error("Error updating center:", error);
      alert("Ocorreu um erro ao salvar as alterações. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
            type="button"
            disabled={loading}
          >
            ✕
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label className={styles.label}>Nome</label>
            <input
              ref={firstInputRef}
              className={styles.input}
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              placeholder="Nome do centro"
              required
              disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
              />
            </div>
            <div>
              <label className={styles.label}>E-mail</label>
              <input
                className={styles.input}
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="contato@exemplo.org"
                disabled={loading}
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
              disabled={loading}
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
                  disabled={loading}
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
                      setForm((s) => {
                        if (s.imagePreview && s.imageFile) {
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
              )}
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
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
