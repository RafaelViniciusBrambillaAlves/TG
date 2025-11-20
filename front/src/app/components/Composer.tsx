"use client";

import React, { useState } from "react";
import styles from "./composer.module.css";
import api from "@/services/api";

type ComposerProps = {
  onCreate?: (text: string, file?: File | null) => void;
};

export default function Composer({ onCreate }: ComposerProps) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!text.trim() && !preview) return;
    onCreate?.(text.trim(), file ?? null);

    setText("");
    setPreview(null);
    setFile(null);
  }

  return (
    <form
      className={styles.composer}
      onSubmit={handleSubmit}
      aria-label="Criar publicação"
    >
      <div className={styles.top}>
        <textarea
          className={styles.textarea}
          placeholder="Como você está pensando em ajudar Hoje?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
      </div>

      {preview && (
        <div className={styles.preview}>
          <img
            src={preview}
            alt="Pré-visualização"
            className={styles.previewImg}
          />
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              setPreview(null);
              setFile(null);
            }}
            aria-label="Remover anexo"
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.controls}>
        <label className={styles.fileLabel}>
          <input type="file" accept="image/*,video/*" onChange={handleFile} />
          Adicionar foto/vídeo
        </label>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              setText("");
              setPreview(null);
              setFile(null);
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.primary}
            aria-disabled={!text.trim() && !preview}
          >
            Publicar
          </button>
        </div>
      </div>
    </form>
  );
}
