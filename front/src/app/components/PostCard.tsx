// src/components/PostCard.tsx
"use client";

import React, { useMemo, useState } from "react";
import styles from "./post.module.css";
import { Post } from "@/app/mocks";
import { FiShare2, FiBookmark, FiEdit, FiTrash2 } from "react-icons/fi";
import { BsFillBookmarkFill } from "react-icons/bs";
import ProfileModal, { ProfileShape } from "./ProfileModal";

type Props = {
  post: Post;
  onToggleSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
  currentUser?: string;
};

export default function PostCard({ post, onToggleSave, onShare, onEdit, onDelete, currentUser }: Props) {
  const createdDate = new Date(post.data_criacao);
  const [modalOpen, setModalOpen] = useState(false);

  const computeTimeAgo = () => {
    const diff = Math.floor((Date.now() - createdDate.getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 3600 * 24) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / (3600 * 24))}d`;
  };

  const isMine = post?.usuario?.nome === currentUser;

  const personName = post?.usuario?.nome ?? "Autor desconhecido";
  const avatar = post?.usuario?.avatar ?? post?.organizacao?.logo ?? `https://i.pravatar.cc/80?u=${encodeURIComponent(personName)}`;

  const profile: ProfileShape = useMemo(() => ({
    name: personName,
    email: post?.usuario?.email ?? null,
    phone: post?.usuario?.telefone ?? null,
    organization: post?.organizacao?.nome ?? post?.usuario?.org ?? null,
    avatar,
  }), [personName, post, avatar]);

  return (
    <>
      <article className={styles.card} aria-labelledby={`post-${post._id}-title`}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.avatarButton}
              onClick={() => setModalOpen(true)}
              aria-label={`Abrir perfil de ${personName}`}
              title={`Abrir perfil de ${personName}`}
            >
              <img src={avatar} alt={personName} className={styles.avatar} />
            </button>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div className={styles.author}>{personName}</div>
              </div>

              <div className={styles.meta}>
                <span className={styles.title} id={`post-${post._id}-title`}>{post.titulo || "Sem título"}</span>
                <span className={styles.dot}>•</span>
                <time className={styles.time}>{computeTimeAgo()}</time>
              </div>
            </div>
          </div>

          <div className={styles.headerRight}>
            <button className={styles.iconButton} onClick={() => onShare?.(post.id)} aria-label={`Compartilhar publicação ${post.id}`} type="button">
              <FiShare2 size={18} />
            </button>

            <button className={styles.iconButton} onClick={() => onToggleSave?.(post.id)} aria-label={post.status ? "Remover dos salvos" : "Salvar publicação"} type="button">
              {post.status ? <BsFillBookmarkFill size={18} /> : <FiBookmark size={18} />}
            </button>

            {isMine && (
              <>
                <button className={styles.iconButton} onClick={() => onEdit?.(post)} aria-label="Editar postagem" type="button">
                  <FiEdit size={18} />
                </button>
                <button className={styles.iconButton} onClick={() => onDelete?.(post.id)} aria-label="Excluir postagem" type="button">
                  <FiTrash2 size={18} />
                </button>
              </>
            )}
          </div>
        </header>

        <div className={styles.body}>
          <p className={styles.description}>{post.descricao}</p>
          {post.image && <img src={post.image} alt={post.titulo ?? ""} className={styles.image} />}
        </div>
      </article>

      <ProfileModal visible={modalOpen} onClose={() => setModalOpen(false)} profile={profile} />
    </>
  );
}
