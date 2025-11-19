"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./createEmergency.module.css"; // usa o mesmo estilo do emergency
import type { Volunteer } from "@/app/mocks";
import api from "@/services/api";

type CreateVolunteerData = {
  nome: string;
  senha: string;
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
    nome: "",
    senha: "",
    email: "",
    phone: "",
    skills: "",
    imageFile: null,
    imagePreview: null,
  });

  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // cleanup preview URL on unmount
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
      if (form.imagePreview) {
        try {
          URL.revokeObjectURL(form.imagePreview);
        } catch {}
      }
      setForm({
        nome: "",
        senha: "",
        email: "",
        phone: "",
        skills: "",
        imageFile: null,
        imagePreview: null,
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

  function handleChange<K extends keyof CreateVolunteerData>(key: K, value: CreateVolunteerData[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function validate() {
    // exige nome e senha (senha >= 6)
    return form.nome.trim().length > 2 && form.senha.trim().length >= 6;
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/api/v1/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      // optional: onUploadProgress can be added if you want progress UI
    });

    const data = res.data ?? {};
    // aceita várias formas de resposta:
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
      if (!validate()) {
        alert("Por favor preencha o nome (min 3 caracteres) e senha (min 6 caracteres).");
        return;
      }

      setLoading(true);

      // 1) upload da imagem se houver
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
        // se houver apenas preview (hipotético), deixamos undefined para não salvar objeto temporário
        imageUrl = form.imagePreview;
      }

      // 2) montar payload do voluntário
      const payload: any = {
        // campos esperados para criar usuário/voluntário
        nome: form.nome.trim(),
        senha: form.senha.trim(),
        email: form.email?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        skills: form.skills?.trim() || undefined,
        image: imageUrl || undefined,
      };

      // 3) POST para criar (adapte endpoint se necessário)
      const res = await api.post("/api/v1/usuarios/register", payload);

      const serverData = res.data ?? null;
      const created: Volunteer = serverData
        ? {
            // tenta mapear respostas comuns
            nome: serverData.nome ?? serverData.nome ?? payload.nome,
            email: serverData.email ?? payload.email,
            phone: serverData.phone ?? payload.phone,
            skills: serverData.skills ?? payload.skills,
            image:
              (serverData.image && typeof serverData.image === "string"
                ? serverData.image
                : serverData.imageUrl
                ? serverData.imageUrl
                : serverData.imageFileId
                ? `/api/v1/files/${serverData.imageFileId}`
                : payload.image) ?? undefined,
            createdAt: serverData.createdAt ?? new Date().toISOString(),
            // não incluir senha ao retornar objeto
            ...(typeof serverData === "object" ? serverData : {}),
          }
        : {
            nome: payload.nome,
            email: payload.email,
            phone: payload.phone,
            skills: payload.skills,
            image: payload.image,
            createdAt: new Date().toISOString(),
          };

      // 4) limpa preview (revoga URL)
      if (form.imagePreview) {
        try {
          URL.revokeObjectURL(form.imagePreview);
        } catch {}
      }

      // 5) callback com o voluntário criado
      onCreate(created);
      onClose();
    } catch (error) {
      console.error("Error creating volunteer:", error);
      alert("Ocorreu um erro ao cadastrar o voluntário.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.overlay} ref={modalRef} onMouseDown={handleOutsideClick} aria-modal="true" role="dialog">
      <div className={styles.modal} role="document" onMouseDown={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h3 className={styles.title}>Cadastrar Voluntário</h3>
          <button className={styles.close} onClick={onClose} aria-label="Fechar" type="button" disabled={loading}>
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
              placeholder="Nome do voluntário"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Senha</label>
            <input
              type="password"
              className={styles.input}
              value={form.senha}
              onChange={(e) => handleChange("senha", e.target.value)}
              placeholder="Senha (mínimo 6 caracteres)"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Email (opcional)</label>
            <input
              className={styles.input}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="exemplo@email.com"
              disabled={loading}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Telefone (opcional)</label>
            <input
              className={styles.input}
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="(99) 99999-9999"
              disabled={loading}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Habilidades / Experiência (opcional)</label>
            <textarea
              className={styles.input}
              rows={3}
              value={form.skills}
              onChange={(e) => handleChange("skills", e.target.value)}
              placeholder="Ex: primeiros socorros, logística..."
              disabled={loading}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Imagem (opcional)</label>
            <div className={styles.fileRow}>
              <label className={styles.fileLabel}>
                <input type="file" accept="image/*" onChange={handleFileChange} disabled={loading} />
                Selecionar imagem
              </label>

              {form.imagePreview ? (
                <div className={styles.previewWrap}>
                  <img src={form.imagePreview} alt="Preview" className={styles.preview} />
                  <button
                    type="button"
                    className={styles.removePreview}
                    onClick={() =>
                      setForm((s) => {
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
            <button type="button" className={styles.secondary} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.primary} disabled={loading}>
              {loading ? "Enviando..." : "Cadastrar"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
