"use client";

import React from "react";
import styles from "./centers.module.css";
import type { Centro } from "@/hooks/getCentros";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type Props = {
  centers: Centro[];
  onEdit: (center: Centro) => void;
  onDelete?: (id: string) => Promise<void> | void;
};

export default function CentersList({ centers = [], onEdit, onDelete }: Props) {
  const [toDelete, setToDelete] = React.useState<Centro | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const resolveImage = (img?: string) => {
    if (!img) return null;
    if (/^https?:\/\//.test(img)) return img;
    if (img.startsWith("/")) return `${process.env.API_URL}${img}`;
    return img;
  };

  const closeModal = () => {
    setToDelete(null);
    setIsDeleting(false);
    setError(null);
  };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (toDelete) {
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [toDelete]);

  const handleConfirmDelete = async () => {
    if (!toDelete) return;

    try {
      setIsDeleting(true);
      if (onDelete) await onDelete(toDelete._id);
      closeModal();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao excluir.";
      setError(msg);
      setIsDeleting(false);
    }
  };

  return (
    <section className={styles.wrap} aria-label="Lista de centros">
      <header className={styles.header}>
        <h2 className={styles.title}>Centros</h2>
        <p className={styles.subtitle}>Seus centros cadastrados.</p>
      </header>

      <div className={styles.grid}>
        {centers.map((c) => {
          const imgSrc = resolveImage(c?.image);
          return (
            <article
              key={c._id}
              className={styles.card}
              aria-labelledby={`center-${c._id}-name`}
            >
              <div className={styles.cardLeft}>
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={c?.nome || "Centro"}
                    className={styles.thumb}
                  />
                ) : (
                  <div className={styles.noImage}>Sem imagem</div>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <div className={styles.titleBlock}>
                    <h3
                      id={`center-${c._id}-name`}
                      className={styles.centerName}
                    >
                      {c.nome}
                    </h3>
                    {c.short && (
                      <div className={styles.centerSubtitle}>{c.short}</div>
                    )}
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.iconButton}
                      aria-label={`Editar ${c.nome}`}
                      type="button"
                      onClick={() => onEdit(c)}
                      title="Editar"
                    >
                      <FiEdit />
                    </button>
                    <button
                      className={styles.iconButton}
                      aria-label={`Excluir ${c.nome}`}
                      type="button"
                      title="Excluir"
                      onClick={() => setToDelete(c)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <p className={styles.centerDesc}>
                  {c.description ?? "Descrição não informada."}
                </p>

                <dl className={styles.meta}>
                  {c.telefone && (
                    <div>
                      <dt>Telefone</dt>
                      <dd>{c.telefone}</dd>
                    </div>
                  )}
                  {c.email && (
                    <div>
                      <dt>E-mail</dt>
                      <dd>{c.email}</dd>
                    </div>
                  )}
                  {c.address && (
                    <div>
                      <dt>Endereço</dt>
                      <dd>{c.address}</dd>
                    </div>
                  )}

                  {!c.telefone && !c.email && !c.address && (
                    <div>
                      <dt>Info</dt>
                      <dd>Sem informações de contato</dd>
                    </div>
                  )}
                </dl>
              </div>
            </article>
          );
        })}
      </div>

      {toDelete && (
        <div
          style={modalStyles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          onClick={closeModal}
        >
          <div style={modalStyles.dialog} onClick={(e) => e.stopPropagation()}>
            <h3 id="confirm-delete-title" style={modalStyles.title}>
              Excluir centro
            </h3>
            <p style={modalStyles.text}>
              Tem certeza que deseja excluir "<strong>{toDelete.nome}</strong>"?
              Esta ação não poderá ser desfeita.
            </p>

            {error && (
              <div style={modalStyles.alert} role="alert">
                {error}
              </div>
            )}

            <div style={modalStyles.actions}>
              <button
                type="button"
                onClick={closeModal}
                disabled={isDeleting}
                style={modalStyles.cancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={modalStyles.danger}
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 1000,
  } as React.CSSProperties,
  dialog: {
    background: "#fff",
    borderRadius: "8px",
    padding: "20px",
    width: "min(520px, 100%)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  } as React.CSSProperties,
  title: {
    color: "#333",
    margin: "0 0 8px 0",
    fontSize: "1.25rem",
    fontWeight: 600,
  } as React.CSSProperties,
  text: {
    margin: "0 0 16px 0",
    lineHeight: 1.5,
    color: "#333",
  } as React.CSSProperties,
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "16px",
  } as React.CSSProperties,
  cancel: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#333",
    cursor: "pointer",
  } as React.CSSProperties,
  danger: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid",
    background: "#f43f5e",
    color: "#fff",
    cursor: "pointer",
  } as React.CSSProperties,
  alert: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    padding: "8px 10px",
    marginTop: "8px",
  } as React.CSSProperties,
};
