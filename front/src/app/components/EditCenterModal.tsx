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
  imagePreview?: string | null; // pode ser blob:... ou URL do servidor
  imageRemoved?: boolean; // controla remoção explícita
};

// Gera uma URL válida ou null quando não houver imagem
function resolveServerImage(img?: string | null): string | null {
  if (!img || typeof img !== "string" || img.trim() === "") return null;
  if (/^https?:\/\//.test(img)) return img;
  if (img.startsWith("/")) return `http://localhost:3001${img}`;
  return `http://localhost:3001${img.replace(/^\/+/, "")}`;
}

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
    imageRemoved: false,
  });

  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // sempre revoga previews antigos ao desmontar (apenas se for blob:)
  useEffect(() => {
    return () => {
      if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
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
        nome:
          // @ts-ignore
          center.nome ??
          // @ts-ignore
          center.name ??
          "",
        description:
          // @ts-ignore
          center.description ??
          // @ts-ignore
          center.descricao ??
          "",
        phone:
          // @ts-ignore
          center.phone ??
          // @ts-ignore
          center.telefone ??
          "",
        email:
          // @ts-ignore
          center.email ?? "",
        address:
          // @ts-ignore
          center.address ?? "",
        imageFile: null,
        // mostra a imagem atual se existir (pode ser url relativa)
        // @ts-ignore
        imagePreview: resolveServerImage(center.image),
        imageRemoved: false, // reset do estado de remoção
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
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

    const MAX = 8 * 1024 * 1024;
    if (f.size > MAX) {
      alert("Arquivo muito grande. Tamanho máximo: 8MB.");
      e.currentTarget.value = "";
      return;
    }

    // revoga preview anterior, se era objectURL
    if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(form.imagePreview);
      } catch {}
    }

    const url = URL.createObjectURL(f);
    setForm((s) => ({
      ...s,
      imageFile: f,
      imagePreview: url,
      imageRemoved: false,
    }));

    // limpa o input para permitir re-escolher o mesmo arquivo
    e.currentTarget.value = "";
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

      // Identificador do registro (preserva _id ou id original)
      // @ts-ignore
      const uid = (center as any)?._id ?? (center as any)?.id;

      // Monta payload base
      const payload: any = {
        // @ts-ignore
        ...center,
        // sobrescreve campos editáveis
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
        // IDs garantidos
        _id: uid,
        id: uid,
      };

      // Regras para imagem:
      // - se escolheu nova imagem, faz upload e envia payload.image = nova URL
      // - se removeu a imagem e não escolheu outra, envia payload.image = null (para limpar)
      // - se não mudou nada, NÃO envie a chave image (deixe como está no servidor)
      if (form.imageFile) {
        try {
          const imageUrl = await uploadFile(form.imageFile);
          payload.image = imageUrl;
        } catch (err) {
          console.error("Erro ao enviar imagem:", err);
          alert("Falha ao enviar a imagem. Tente novamente.");
          setLoading(false);
          return;
        }
      } else if (form.imageRemoved) {
        payload.image = null; // chave explícita para o backend limpar
      } else {
        // não envia image para preservar a existente
        delete payload.image;
      }

      let serverUpdated: any = null;
      if (uid) {
        try {
          const res = await api.put(`/api/v1/centros/${uid}`, payload);
          serverUpdated = res.data ?? null;
        } catch (err) {
          console.warn(
            "Falha ao atualizar no servidor, atualizando localmente:",
            err,
          );
          // segue com atualização local
        }
      }

      // Merge final
      let finalCenter: Center =
        serverUpdated && typeof serverUpdated === "object"
          ? { ...(center as any), ...serverUpdated }
          : { ...(center as any), ...payload };

      // Garante que o identificador permaneça
      // @ts-ignore
      finalCenter._id = uid;
      // @ts-ignore
      finalCenter.id = uid;

      // Se marcamos remoção e o servidor ainda retornou imagem, força limpar na UI
      if (form.imageRemoved) {
        // @ts-ignore
        finalCenter.image = null;
      }

      // Revoga preview se era blob:
      if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(form.imagePreview);
        } catch {}
      }

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
                  ref={fileInputRef}
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
                    onError={() =>
                      setForm((s) => ({
                        ...s,
                        imagePreview: null,
                        imageFile: null,
                        imageRemoved: true,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className={styles.removePreview}
                    onClick={() =>
                      setForm((s) => {
                        if (
                          s.imagePreview &&
                          s.imagePreview.startsWith("blob:")
                        ) {
                          try {
                            URL.revokeObjectURL(s.imagePreview);
                          } catch {}
                        }
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                        return {
                          ...s,
                          imageFile: null,
                          imagePreview: null,
                          imageRemoved: true,
                        };
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
