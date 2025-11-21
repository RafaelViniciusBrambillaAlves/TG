"use client";

import React, { useEffect, useState } from "react";
import styles from "./needsModal.module.css";
import {
  Center,
  Emergency,
  MOCK_CENTERS,
  MOCK_EMERGENCIES,
  Need,
} from "@/app/mocks";
import { Centro } from "@/hooks/getCentros";
import { Emergencia } from "@/hooks/getEmergencias";
import api from "@/services/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (need: Need) => void;
  centersFilterOrgId?: string;
  centers: Centro[];
  emergencies: Emergencia[];
} & Partial<Need>; // permite passar dados para edição

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
  const [status, setStatus] = useState<Need["status"]>(
    editData.status ?? "Aberta",
  );
  const [centerId, setCenterId] = useState(editData.centerId);
  const [emergencyId, setEmergencyId] = useState(editData.emergencyId);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTitle(editData.title ?? "");
      setDescription(editData.description ?? "");
      setType(editData.type ?? "Doação");
      setQuantity(editData.quantity ?? "");
      setStatus(editData.status ?? "Aberta");
      setCenterId(editData.centerId);
      setEmergencyId(editData.emergencyId);
      setError(null);
      setLoading(false);

      // Limpar preview da imagem
      if (imagePreview) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {}
      }
      setImageFile(null);
      setImagePreview(null);
    }
  }, [open, editData, imagePreview]);

  // Cleanup preview URL quando componente desmonta
  useEffect(() => {
    return () => {
      if (imagePreview) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {}
      }
    };
  }, [imagePreview]);

  const center = centersFilterOrgId
    ? centers.filter((c) => c.orgId === centersFilterOrgId)
    : centers;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    // Tamanho máximo client-side (8MB)
    const MAX = 8 * 1024 * 1024;
    if (f.size > MAX) {
      alert("Arquivo muito grande. Tamanho máximo: 8MB.");
      e.currentTarget.value = "";
      return;
    }

    // Revoga preview anterior se houver
    if (imagePreview) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {}
    }

    const url = URL.createObjectURL(f);
    setImageFile(f);
    setImagePreview(url);
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/api/v1/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const data = res.data ?? {};
    if (typeof data === "string") {
      return data;
    }
    if (data.url) return data.url;
    if (data.fileId) return `/api/v1/files/${data.fileId}`;
    if (data.file?._id) return `/api/v1/files/${data.file._id}`;
    if (data._id) return `/api/v1/files/${data._id}`;

    throw new Error("Resposta de upload inválida");
  }

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!title.trim()) return setError("Título é obrigatório");
      if (!description.trim()) return setError("Descrição é obrigatória");
      if (!centerId) return setError("Selecione um centro");

      // 1. Upload da imagem se existir
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        try {
          imageUrl = await uploadFile(imageFile);
        } catch (err) {
          console.error("Erro ao enviar imagem:", err);
          setError("Falha ao enviar a imagem. Tente novamente.");
          return;
        }
      }

      // 2. Criar necessidade
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
        image: imageUrl, // Adicionar URL da imagem
      };

      const method = editData._id ? "PUT" : "POST";
      const url = editData._id
        ? `/api/v1/necessidades/${editData._id}`
        : "/api/v1/necessidades";

      await api({
        url,
        method,
        data: newNeed,
      });

      onCreate(newNeed);

      // Limpar preview
      if (imagePreview) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {}
      }

      onClose();
    } catch (err: any) {
      console.error('Error creating/updating need:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao salvar necessidade');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <h3 className={styles.title}>
            {editData._id ? "Editar necessidade" : "Criar necessidade"}
          </h3>
          <button
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar"
            disabled={loading}
          >
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <label className={styles.row}>
            <div className={styles.label}>Título</div>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </label>

          <label className={styles.row}>
            <div className={styles.label}>Descrição</div>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </label>

          <div className={styles.rowSplit}>
            <label className={styles.rowSmall}>
              <div className={styles.label}>Tipo</div>
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
              <div className={styles.label}>Quantidade</div>
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
              <div className={styles.label}>Status</div>
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
              <div className={styles.label}>Centro</div>
              <select
                className={styles.select}
                value={centerId}
                onChange={(e) => setCenterId(e.target.value)}
                disabled={loading}
              >
                <option value="">-- selecione --</option>
                {center?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={styles.row}>
            <div className={styles.label}>Emergência (opcional)</div>
            <select
              className={styles.select}
              value={emergencyId}
              onChange={(e) => setEmergencyId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- nenhuma --</option>
              {emergencies?.map((em) => (
                <option key={em._id} value={em._id}>
                  {em.titulo}
                </option>
              ))}
            </select>
          </label>

          {/* Campo de imagem */}
          <div className={styles.row}>
            <div className={styles.label}>Imagem (opcional)</div>
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

              {imagePreview && (
                <div className={styles.previewWrap}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className={styles.preview}
                  />
                  <button
                    type="button"
                    className={styles.removePreview}
                    onClick={() => {
                      if (imagePreview) {
                        try {
                          URL.revokeObjectURL(imagePreview);
                        } catch {}
                      }
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    disabled={loading}
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.primary} disabled={loading}>
              {loading ? "Salvando..." : (editData._id ? "Salvar alterações" : "Criar necessidade")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
