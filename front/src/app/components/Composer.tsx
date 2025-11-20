"use client";

import React, { useRef, useEffect, useState } from "react";
import styles from "./composer.module.css";

type ComposerProps = {
  onCreate?: (text: string, file?: File | null) => void;
};

export default function Composer({ onCreate }: ComposerProps) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // revoga preview ao desmontar
  useEffect(() => {
    return () => {
      if (preview) {
        try {
          URL.revokeObjectURL(preview);
        } catch {}
      }
    };
  }, [preview]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    // revoga preview anterior antes de criar outro
    if (preview) {
      try {
        URL.revokeObjectURL(preview);
      } catch {}
    }

    const url = URL.createObjectURL(f);
    setFile(f);
    setPreview(url);

    // limpa value do input para permitir re-selecionar o mesmo arquivo se necessário
    e.currentTarget.value = "";
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!text.trim() && !preview) return;
    await onCreate?.(text.trim(), file ?? null);

    // limpa estado e revoga URL
    setText("");
    if (preview) {
      try {
        URL.revokeObjectURL(preview);
      } catch {}
    }
    setPreview(null);
    setFile(null);

    // limpa também o input
    if (inputRef.current) inputRef.current.value = "";
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
          placeholder="Crie uma publicação"
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
              if (preview) {
                try {
                  URL.revokeObjectURL(preview);
                } catch {}
              }
              setPreview(null);
              setFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            aria-label="Remover anexo"
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.controls}>
        <label className={styles.fileLabel}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFile}
          />
          Adicionar foto/vídeo
        </label>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              setText("");
              if (preview) {
                try {
                  URL.revokeObjectURL(preview);
                } catch {}
              }
              setPreview(null);
              setFile(null);
              if (inputRef.current) inputRef.current.value = "";
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
