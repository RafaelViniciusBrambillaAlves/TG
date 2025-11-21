"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./createNeedModal.module.css";
import { Centro } from "@/hooks/getCentros";
import { Emergencia } from "@/hooks/getEmergencias";
import api from "@/services/api";
import type { Need } from "@/app/mocks"; // ajuste conforme sua tipagem real

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (need: Need) => void;
  centersFilterOrgId?: string;
  centers: Centro[];
  emergencies: Emergencia[];
} & Partial<Need>;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

export default function CreateNeedModal({
  open,
  onClose,
  onCreate,
  centersFilterOrgId,
  centers,
  emergencies,
  ...editData
}: Props) {
  const [title, setTitle] = useState(editData.title ?? "");
  const [description, setDescription] = useState(editData.description ?? "");
  const [type, setType] = useState<Need["type"]>(editData.type ?? "Doação");
  const [quantity, setQuantity] = useState(editData.quantity ?? "");
  const [status, setStatus] = useState<Need["status"]>(editData.status ?? "Aberta");
  const [centerId, setCenterId] = useState<string | undefined>(editData.centerId);
  const [emergencyId, setEmergencyId] = useState<string | undefined>(editData.emergencyId);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // imagem
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // centers filter
  const centerList = centersFilterOrgId ? centers.filter((c) => c.orgId === centersFilterOrgId) : centers;

  useEffect(() => {
    if (open) {
      // focus no primeiro campo
      setTimeout(() => firstInputRef.current?.focus(), 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // reset quando fechar
      resetFormToEditData();
    }
    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // cleanup preview URL quando desmonta
  useEffect(() => {
    return () => {
      if (imagePreview) {
        try { URL.revokeObjectURL(imagePreview); } catch {}
      }
    };
  }, [imagePreview]);

  function resetFormToEditData() {
    setTitle(editData.title ?? "");
    setDescription(editData.description ?? "");
    setType(editData.type ?? "Doação");
    setQuantity(editData.quantity ?? "");
    setStatus(editData.status ?? "Aberta");
    setCenterId(editData.centerId);
    setEmergencyId(editData.emergencyId);
    setError(null);
    setLoading(false);
    // limpar image preview
    if (imagePreview) {
      try { URL.revokeObjectURL(imagePreview); } catch {}
    }
    setImageFile(null);
    setImagePreview(null);
    setImageName(null);
  }

  function handleOutsideClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleFileSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.size > MAX_IMAGE_BYTES) {
      alert("Arquivo muito grande. Tamanho máximo 8MB.");
      // limpar o input
      e.currentTarget.value = "";
      return;
    }

    // revoga preview anterior
    if (imagePreview) {
      try { URL.revokeObjectURL(imagePreview); } catch {}
    }

    const url = URL.createObjectURL(f);
    setImageFile(f);
    setImagePreview(url);
    setImageName(f.name);
  }

  function triggerFilePicker() {
    fileInputRef.current?.click();
  }

  function removeImage() {
    if (imagePreview) {
      try { URL.revokeObjectURL(imagePreview); } catch {}
    }
    setImageFile(null);
    setImagePreview(null);
    setImageName(null);
    // limpar input value para permitir selecionar o mesmo arquivo depois
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  function validate() {
    if (!title.trim()) { setError("Título é obrigatório"); return false; }
    if (!description.trim()) { setError("Descrição é obrigatória"); return false; }
    if (!centerId) { setError("Selecione um centro"); return false; }
    setError(null);
    return true;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // upload da imagem (se houver)
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        try {
          imageUrl = await uploadFile(imageFile);
        } catch (err) {
          console.error("Erro ao enviar imagem:", err);
          setError("Falha ao enviar a imagem. Tente novamente.");
          setLoading(false);
          return;
        }
      }

      const newNeed: Need = {
        _id: editData._id,
        title: title.trim(),
        description: description.trim(),
        type,
        quantity: quantity.trim() || undefined,
        status,
        centerId,
        emergencyId: emergencyId!,
        createdAt: editData.createdAt ?? new Date().toISOString(),
        interestCount: editData.interestCount ?? 0,
        image: imageUrl,
      };

      const method = editData._id ? "PUT" : "POST";
      const url = editData._id ? `/api/v1/necessidades/${editData._id}` : "/api/v1/necessidades";

      await api({ url, method, data: newNeed });

      onCreate(newNeed);

      // cleanup preview
      if (imagePreview) {
        try { URL.revokeObjectURL(imagePreview); } catch {}
      }

      onClose();
    } catch (err: any) {
      console.error("Error creating/updating need:", err);
      setError(err.response?.data?.message || err.message || "Erro ao salvar necessidade");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.overlay} onMouseDown={handleOutsideClick} role="dialog" aria-modal="true">
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()} role="document">
        <header className={styles.header}>
          <h3 className={styles.title}>{editData._id ? "Editar necessidade" : "Criar necessidade"}</h3>
          <button
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar"
            type="button"
            disabled={loading}
          >
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <label className={styles.row}>
            <span className={styles.label}>Título</span>
            <input
              ref={firstInputRef}
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              aria-required
            />
          </label>

          <label className={styles.row}>
            <span className={styles.label}>Descrição</span>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={4}
              aria-required
            />
          </label>

          <div className={styles.rowSplit}>
            <label className={styles.rowSmall}>
              <span className={styles.label}>Tipo</span>
              <select
                className={styles.select}
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                disabled={loading}
              >
                <option>Doação</option>
                <option>Voluntário</option>
                <option>Serviço</option>
                <option>Outro</option>
              </select>
            </label>

            <label className={styles.rowSmall}>
              <span className={styles.label}>Quantidade</span>
              <input
                className={styles.input}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="ex: 10 unidades / 50kg"
                disabled={loading}
              />
            </label>
          </div>

          <div className={styles.rowSplit}>
            <label className={styles.rowSmall}>
              <span className={styles.label}>Status</span>
              <select
                className={styles.select}
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={loading}
              >
                <option>Aberta</option>
                <option>Parcial</option>
                <option>Atendida</option>
              </select>
            </label>

            <label className={styles.rowSmall}>
              <span className={styles.label}>Centro</span>
              <select
                className={styles.select}
                value={centerId || ""}
                onChange={(e) => setCenterId(e.target.value || undefined)}
                disabled={loading}
                required
              >
                <option value="">-- selecione --</option>
                {centerList?.map((c) => (
                  <option key={(c as any)._id} value={(c as any)._id}>
                    {(c as any).nome}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={styles.row}>
            <span className={styles.label}>Emergência (opcional)</span>
            <select
              className={styles.select}
              value={emergencyId || ""}
              onChange={(e) => setEmergencyId(e.target.value || undefined)}
              disabled={loading}
            >
              <option value="">-- nenhuma --</option>
              {emergencies?.map((em) => (
                <option key={(em as any)._id} value={(em as any)._id}>
                  {(em as any).titulo}
                </option>
              ))}
            </select>
          </label>

          {/* ---------------- IMAGE FIELD ---------------- */}
          <div className={styles.row}>
            <span className={styles.label}>Imagem (opcional)</span>

            <div className={styles.imageField}>
              <input
                ref={fileInputRef}
                className={styles.fileInput}
                type="file"
                accept="image/*"
                onChange={handleFileSelection}
                disabled={loading}
                aria-hidden
              />

              <button
                type="button"
                className={styles.selectButton}
                onClick={triggerFilePicker}
                disabled={loading}
                aria-label="Selecionar imagem"
              >
                {/* Ícone simples via CSS pseudo-element ou emoji */}
                <span className={styles.selectIcon} aria-hidden>🖼️</span>
                <span>Selecionar imagem</span>
              </button>

              <div className={styles.imageMeta}>
                {imageName ? (
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName} title={imageName}>{imageName}</span>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={removeImage}
                      aria-label="Remover imagem"
                      disabled={loading}
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className={styles.hint}>PNG, JPG — máximo 8MB</div>
                )}
              </div>
            </div>

            {imagePreview && (
              <div className={styles.previewWrap}>
                <img src={imagePreview} alt="Preview da imagem selecionada" className={styles.preview} />
              </div>
            )}
          </div>

          <footer className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.primary} disabled={loading}>
              {loading ? "Salvando..." : (editData._id ? "Salvar alterações" : "Criar necessidade")}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
