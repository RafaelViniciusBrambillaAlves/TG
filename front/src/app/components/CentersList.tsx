"use client";

import React from "react";
import styles from "./centers.module.css";
import type { Centro } from "@/hooks/getCentros";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type Props = {
  centers: Centro[];
  onEdit: (center: Centro) => void;
};

export default function CentersList({ centers = [], onEdit }: Props) {
  const resolveImage = (img?: string) => {
    if (!img) return null;
    if (/^https?:\/\//.test(img)) return img;
    if (img.startsWith("/")) return `http://localhost:3001${img}`;
    return img;
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
                    <h3 id={`center-${c._id}-name`} className={styles.centerName}>
                      {c.nome}
                    </h3>
                    {c.short && <div className={styles.centerSubtitle}>{c.short}</div>}
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

                  {/* caso não tenha nenhum meta, mostra uma linha neutra */}
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
    </section>
  );
}
