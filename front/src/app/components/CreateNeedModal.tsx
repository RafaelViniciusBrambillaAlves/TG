"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./createNeedModal.module.css";
import { Centro } from "@/hooks/getCentros";
import { Emergencia } from "@/hooks/getEmergencias";
import api from "@/services/api";
import type { Need } from "@/app/mocks";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (need: Need) => void;
  centersFilterOrgId?: string;
  centers: Centro[];
  emergencies: Emergencia[];
} & Partial<Need>;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

function resolveServerImage(img?: string | null): string | null {
  if (!img || typeof img !== "string" || img.trim() === "") return null;
  if (/^https?:\/\//.test(img)) return img;
  if (img.startsWith("/")) return `http://localhost:3001${img}`;
  return `http://localhost:3001${img.replace(/^\/+/, "")}`;
}

function fileNameFromPath(path?: string | null): string | null {
  if (!path) return null;
  try {
    const u = new URL(resolveServerImage(path) || path);
    const last = u.pathname.split("/").filter(Boolean).pop();
    return last || null;
  } catch {
    const last = path.split("/").filter(Boolean).pop();
    return last || null;
  }
}

export default function CreateNeedModal({ ...props }: Props) {
  const {
    open,
    onClose,
    onCreate,
    centersFilterOrgId,
    centers,
    emergencies,
    ...editData
  } = props;

  const [title, setTitle] = useState(editData.title ?? "");
  const [description, setDescription] = useState(editData.description ?? "");
  const [type, setType] = useState<Need["type"]>(editData.type ?? "Doação");
  const [quantity, setQuantity] = useState(editData.quantity ?? "");
  const [status, setStatus] = useState<Need["status"]>(
    editData.status ?? "Aberta",
  );
  const [centerId, setCenterId] = useState<string | undefined>(
    (editData as any)?.centerId?._id ||
      (editData as any)?.centerId ||
      undefined,
  );
  const [emergencyId, setEmergencyId] = useState<string | undefined>(
    (editData as any)?.emergencyId?._id ||
      (editData as any)?.emergencyId ||
      undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // imagem
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // blob ou URL do servidor
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false); // NOVO: rastreia se usuário removeu a imagem

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // Preenche o formulário e mostra o preview existente (se houver) quando abrir para edição
  useEffect(() => {
    if (!open) return;

    setTitle(editData.title ?? "");
    setDescription(editData.description ?? "");
    setType(editData.type ?? "Doação");
    setQuantity(editData.quantity ?? "");
    setStatus(editData.status ?? "Aberta");
    setCenterId(
      (editData as any)?.centerId?._id ||
        (editData as any)?.centerId ||
        undefined,
    );
    setEmergencyId(
      (editData as any)?.emergencyId?._id ||
        (editData as any)?.emergencyId ||
        undefined,
    );
    setError(null);
    setLoading(false);
    setImageRemoved(false); // NOVO: resetar flag ao abrir

    // limpar preview anterior se era blob
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {}
    }

    // Preview a partir da imagem que já existe no backend
    const existing = (editData as any)?.image as string | undefined;
    const resolved = resolveServerImage(existing);
    setImageFile(null);
    setImagePreview(resolved);
    setImageName(fileNameFromPath(existing));

    // foco e bloqueio de scroll
    setTimeout(() => firstInputRef.current?.focus(), 0);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
    // re-sync quando trocar o item sendo editado
  }, [open, (editData as any)?._id]);

  // cleanup preview URL quando desmonta
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {}
      }
    };
  }, [imagePreview]);

  // centers filtrados, mas garante incluir o selecionado atual (para o select não ficar vazio)
  const centerListBase = centersFilterOrgId
    ? centers.filter((c) => c.orgId === centersFilterOrgId)
    : centers;

  const centerList = React.useMemo(() => {
    if (!centerId) return centerListBase;
    const hasSelected = centerListBase.some((c) => (c as any)._id === centerId);
    if (hasSelected) return centerListBase;
    const fromAll = centers.find((c) => (c as any)._id === centerId);
    return fromAll ? [...centerListBase, fromAll] : centerListBase;
  }, [centers, centerListBase, centerId]);

  function handleOutsideClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleFileSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.size > MAX_IMAGE_BYTES) {
      alert("Arquivo muito grande. Tamanho máximo 8MB.");
      e.currentTarget.value = "";
      return;
    }

    // revoga preview anterior se era objectURL
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {}
    }

    const url = URL.createObjectURL(f);
    setImageFile(f);
    setImagePreview(url);
    setImageName(f.name);
    setImageRemoved(false); // NOVO: ao selecionar nova imagem, não está mais removida

    // permitir selecionar o mesmo arquivo novamente no futuro
    e.currentTarget.value = "";
  }

  function triggerFilePicker() {
    fileInputRef.current?.click();
  }

  function removeImage() {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {}
    }
    setImageFile(null);
    setImagePreview(null);
    setImageName(null);
    setImageRemoved(true); // NOVO: marcar que usuário removeu a imagem
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
    if (!title.trim()) {
      setError("Título é obrigatório");
      return false;
    }
    if (!description.trim()) {
      setError("Descrição é obrigatória");
      return false;
    }
    if (!centerId) {
      setError("Selecione um centro");
      return false;
    }
    setError(null);
    return true;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // upload da nova imagem (se houver)
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

      // CORRIGIDO: Lógica de imagem
      let finalImage: string | undefined = undefined;
      if (imageFile) {
        // Se selecionou uma nova imagem, usa ela
        finalImage = imageUrl;
      } else if (imageRemoved) {
        // Se o usuário removeu a imagem, envia undefined/null para limpar
        finalImage = undefined;
      } else {
        // Se não fez nada, preserva a existente
        finalImage = (editData as any)?.image;
      }

      const newNeed: Need = {
        _id: editData._id,
        title: title.trim(),
        description: description.trim(),
        type,
        quantity: quantity.trim() || undefined,
        status,
        centerId,
        // emergência é opcional; envie undefined se vazio
        emergencyId: emergencyId || undefined,
        createdAt: editData.createdAt ?? new Date().toISOString(),
        interestCount: editData.interestCount ?? 0,
        image: finalImage,
      };

      const method = editData._id ? "PUT" : "POST";
      const url = editData._id
        ? `/api/v1/necessidades/${editData._id}`
        : "/api/v1/necessidades";

      await api({ url, method, data: newNeed });

      onCreate(newNeed);

      // cleanup preview se era blob
      if (imagePreview && imagePreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {}
      }

      onClose();
    } catch (err: any) {
      console.error("Error creating/updating need:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erro ao salvar necessidade",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={handleOutsideClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="document"
      >
        <header className={styles.header}>
          <h3 className={styles.title}>
            {editData._id ? "Editar necessidade" : "Criar necessidade"}
          </h3>
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
                <span className={styles.selectIcon} aria-hidden>
                  🖼️
                </span>
                <span>Selecionar imagem</span>
              </button>

              <div className={styles.imageMeta}>
                {imageName ? (
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName} title={imageName}>
                      {imageName}
                    </span>
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
                <img
                  src={imagePreview}
                  alt="Preview da imagem selecionada"
                  className={styles.preview}
                  onError={() => {
                    // se a URL existente estiver inválida, esconda o preview
                    setImagePreview(null);
                    setImageName(null);
                  }}
                />
              </div>
            )}
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
              {loading
                ? "Salvando..."
                : editData._id
                  ? "Salvar alterações"
                  : "Criar necessidade"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
