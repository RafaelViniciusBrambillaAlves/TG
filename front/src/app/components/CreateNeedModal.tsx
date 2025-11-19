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
    }
  }, [open, editData]);

  const center = centersFilterOrgId
    ? centers.filter((c) => c.orgId === centersFilterOrgId)
    : centers;

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Título é obrigatório");
    if (!description.trim()) return setError("Descrição é obrigatória");
    if (!centerId) return setError("Selecione um centro");
    const newNeed: Need = {
      _id: editData._id, // Inclua _id para edição
      title: title.trim(),
      description: description.trim(),
      type,
      quantity: quantity.trim() || undefined,
      status,
      centerId,
      emergencyId: emergencyId!,
      createdAt: editData.createdAt ?? new Date().toISOString(),
      interestCount: editData.interestCount ?? 0,
    };
    // Use PUT para edição, POST para criação
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
    onClose();
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
            />
          </label>

          <label className={styles.row}>
            <div className={styles.label}>Descrição</div>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className={styles.rowSplit}>
            <label className={styles.rowSmall}>
              <div className={styles.label}>Tipo</div>
              <select
                className={styles.select}
                value={type}
                onChange={(e) => setType(e.target.value as any)}
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
            >
              <option value="">-- nenhuma --</option>
              {emergencies?.map((em) => (
                <option key={em._id} value={em._id}>
                  {em.titulo}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.primary}>
              {editData._id ? "Salvar alterações" : "Criar necessidade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
