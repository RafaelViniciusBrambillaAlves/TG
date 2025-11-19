"use client";

import React from "react";
import styles from "./centers.module.css";
import type { Center } from "@/app/mocks";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Centro } from "@/hooks/getCentros";

type Props = {
  centers: Centro[];
  onEdit: (center: Centro) => void;
};

export default function CentersList({ centers, onEdit }: Props) {
  return (
    <section className={styles.wrap} aria-label="Lista de centros">
      <header className={styles.header}>
        <h2 className={styles.title}>Centros</h2>
        <p className={styles.subtitle}>Seus centros cadastrados.</p>
      </header>

      <div className={styles.grid}>
        {centers?.map((c) => (
          <article
            key={c._id}
            className={styles.card}
            aria-labelledby={`center-${c._id}-name`}
          >
            <div className={styles.cardLeft}>
              <img
                src={`http://localhost:3001${c?.image}`}
                alt={c?.nome}
                className={styles.thumb}
              />
            </div>

            <div className={styles.cardBody}>
              <div className={styles.cardHeader}>
                <h3 id={`center-${c._id}-name`} className={styles.centerName}>
                  {c.nome}
                </h3>
                <div className={styles.actions}>
                  <button
                    className={styles.iconButton}
                    aria-label={`Editar ${c.nome}`}
                    type="button"
                    onClick={() => onEdit(c)}
                  >
                    <FiEdit />
                  </button>
                  <button
                    className={styles.iconButton}
                    aria-label="Excluir centro"
                    type="button"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <p className={styles.centerDesc}>{c.description}</p>

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
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
