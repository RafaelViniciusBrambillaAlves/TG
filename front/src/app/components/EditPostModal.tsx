"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
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
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (post) {
      setText(post?.titulo);
      setImage(post.image || null);
    }
  }, [post]);

  if (!open || !post) return null;

  const handleSave = () => {
    if (!text.trim()) return;
    onUpdate({ ...post, titulo: text.trim(), descricao: text.trim(), image: file });
    onClose();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setImage(url)
  };

  const handleRemoveImage = () => {
    setImage(null)
    setFile(null)
    setPreview(null)
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

        {image && (
          <div className={styles.imagePreview}>
            <img src={`http://localhost:3001${image}`} alt="Preview" />
            <button className={styles.removeImage} onClick={handleRemoveImage}>✕</button>
          </div>
        )}

        <label className={styles.uploadImage}>
          📷 Adicionar/Alterar imagem
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
        </label>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Cancelar</button>
          <button className={styles.save} onClick={handleSave}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
