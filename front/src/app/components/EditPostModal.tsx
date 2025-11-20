"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import styles from "./editPostModal.module.css";
import { Post } from "@/app/mocks";

type Props = {
  post: Post | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: Post) => void;
};

export default function EditPostModal({ post, open, onClose, onUpdate }: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null); // Caminho da imagem original
  const [preview, setPreview] = useState<string | null>(null); // Preview da nova imagem
  const [file, setFile] = useState<File | null>(null); // Novo arquivo selecionado
  const inputRef = useRef<HTMLInputElement>(null);

  // Inicializa com dados do post
  useEffect(() => {
    if (post) {
      setText(post.titulo);
      setImage(post.image || null);
      setPreview(null);
      setFile(null);
    }
  }, [post]);

  // Revoga preview ao desmontar
  useEffect(() => {
    return () => {
      if (preview) {
        try {
          URL.revokeObjectURL(preview);
        } catch {}
      }
    };
  }, [preview]);

  if (!open || !post) return null;

  const handleSave = () => {
    if (!text.trim()) return;
    // Passa o file se houver nova imagem, senão mantém o image original
    onUpdate({ ...post, titulo: text.trim(), descricao: text.trim(), image: file || image });
    onClose();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    // Revoga preview anterior
    if (preview) {
      try {
        URL.revokeObjectURL(preview);
      } catch {}
    }

    const url = URL.createObjectURL(f);
    setFile(f);
    setPreview(url);

    // Limpa value do input para permitir re-selecionar o mesmo arquivo
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemoveImage = () => {
    if (preview) {
      // Removendo nova imagem (preview)
      try {
        URL.revokeObjectURL(preview);
      } catch {}
      setPreview(null);
      setFile(null);
    } else {
      // Removendo imagem original
      setImage(null);
    }
    // Limpa input
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>Editar publicação</div>

        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite a nova descrição..."
        />

        {/* Mostra preview se houver nova imagem, senão a imagem original */}
        {(preview || image) && (
          <div className={styles.imagePreview}>
            <img
              src={preview || `http://localhost:3001${image}`}
              alt="Preview"
            />
            <button className={styles.removeImage} onClick={handleRemoveImage}>✕</button>
          </div>
        )}

        <label className={styles.uploadImage}>
          📷 Adicionar/Alterar imagem
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </label>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Cancelar</button>
          <button className={styles.save} onClick={handleSave}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
