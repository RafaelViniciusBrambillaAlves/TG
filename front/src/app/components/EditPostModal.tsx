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

  useEffect(() => {
    if (post) {
      setText(post.description);
      setImage(post.image || null);
    }
  }, [post]);

  if (!open || !post) return null;

  const handleSave = () => {
    if (!text.trim()) return;
    onUpdate({ ...post, description: text.trim(), image });
    onClose();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => setImage(null);

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
            <img src={image} alt="Preview" />
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
