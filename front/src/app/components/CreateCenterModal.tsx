"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./createcenter.module.css";
import type { Centro } from "@/hooks/getCentros";
import api from "@/services/api";
import { UserProfile } from "./ProfilePage";

type CreateCenterData = {
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
  onClose: () => void;
  onCreate: (center: Centro) => void;
};

export default function CreateCenterModal({ open, onClose, onCreate }: Props) {
  const [user, setUser] = useState<UserProfile | undefined>();

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const [form, setForm] = useState<CreateCenterData>({
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

  useEffect(() => {
    if (open) {
      // focus primeiro campo
      setTimeout(() => firstInputRef.current?.focus(), 0);
      // lock scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // reset form when closed
      setForm({
        nome: "",
        description: "",
        phone: "",
        email: "",
        address: "",
        imageFile: null,
        imagePreview: null,
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
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    // client-side size check (exemplo 8MB)
    const MAX = 8 * 1024 * 1024;
    if (f.size > MAX) {
      alert("Arquivo muito grande. Tamanho máximo: 8MB.");
      e.currentTarget.value = "";
      return;
    }

    const url = URL.createObjectURL(f);
    setForm((s) => ({ ...s, imageFile: f, imagePreview: url }));
  }

  function handleChange<K extends keyof CreateCenterData>(
    key: K,
    value: CreateCenterData[K],
  ) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function validate() {
    return form.nome.trim().length > 2 && form.description.trim().length > 6;
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    // se sua API exigir token, adicione aqui (ex: Authorization)
    const res = await api.post("/api/v1/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // backend idealmente retorna { url: "...", fileId: "..." }
    const { url, fileId } = res.data ?? {};
    // aceita tanto url quanto fileId (monta rota)
    if (url) return url;
    if (fileId) return `/api/v1/files/${fileId}`;
    // se retornar apenas id em outro campo
    if (res.data?.fileId) return `/api/v1/files/${res.data.fileId}`;
    // fallback: se backend retornar objeto file with _id
    if (res.data?.file?._id) return `/api/v1/files/${res.data.file._id}`;
    throw new Error("Resposta de upload inválida");
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

      setLoading(true);

      // 1) se tiver imagem, faz upload e obtém URL
      let imageUrl = form.imagePreview || "";
      if (form.imageFile) {
        try {
          imageUrl = await uploadFile(form.imageFile);
        } catch (err) {
          console.error("Erro ao fazer upload da imagem:", err);
          alert("Falha ao enviar imagem. Tente novamente.");
          setLoading(false);
          return;
        }
      }

      // 2) monta objeto para enviar ao backend
      const payload: Partial<Centro & { orgId?: string }> = {
        orgId: user?.organizations?.[0]?._id,
        nome: form.nome.trim(),
        description: form.description.trim(),
        telefone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        address: form.address?.trim() || "",
        image: imageUrl || undefined,
      };

      // envia para API (espera receber o centro criado)
      const res = await api.post("/api/v1/centros", payload);
      const created: Centro = res.data ?? {
        // fallback caso API não retorne o objeto completo
        _id: `c${Date.now()}`,
        orgId: payload.orgId,
        nome: payload.nome || "",
        description: payload.description || "",
        telefone: payload.telefone,
        email: payload.email,
        address: payload.address,
        image: payload.image,
      };

      // chama callback com o centro criado
      onCreate(created);
      onClose();
    } catch (error) {
      console.error("Error creating center:", error);
      alert("Ocorreu um erro ao cadastrar o centro.");
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
          <h3 className={styles.title}>Cadastrar centro</h3>
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
              {loading ? "Enviando..." : "Cadastrar centro"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
