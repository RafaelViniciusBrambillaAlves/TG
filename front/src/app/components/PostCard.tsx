"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import styles from "./post.module.css";
import { Post } from "@/app/mocks";
import { FiShare2, FiBookmark, FiEdit, FiTrash2, FiCheck } from "react-icons/fi";
import { BsFillBookmarkFill } from "react-icons/bs";
import ProfileModal from "./ProfileModal";
import { Usuario } from "@/hooks/getVoluntarios";

type Props = {
  post: Post;
  onToggleSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
  currentUser?: Usuario;
};

export default function PostCard({
  post,
  onToggleSave,
  onShare,
  onEdit,
  onDelete,
  currentUser,
}: Props) {
  const createdDate = new Date(post.data_criacao);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const shareRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!shareRef.current) return;
      if (!shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    if (shareOpen) document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [shareOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const computeTimeAgo = () => {
    const diff = Math.floor((Date.now() - createdDate.getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 3600 * 24) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / (3600 * 24))}d`;
  };

  const isMine = post?.usuario?._id === currentUser?._id;
  const personName = post?.usuario?.nome ?? "Autor desconhecido";
  const avatar = post?.usuario?.image;

  // --- nova função: busca o nome da organização com várias tentativas de fallback ---
  const getOrgName = () => {
    return post?.usuario?.organizacoes[0]?.name;
  };

  const orgName = getOrgName();

  // canonical share url (adjust path if your app uses different route)
  const shareUrl = useMemo(() => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const id = post._id ?? post.id ?? "";
      return origin ? `${origin}/post/${id}` : `/post/${id}`;
    } catch {
      return `/post/${post._id ?? post.id ?? ""}`;
    }
  }, [post]);

  async function handleNativeShare() {
    if (!navigator?.share) return false;
    try {
      await navigator.share({
        title: post.titulo || "Publicação",
        text: (post.descricao ?? "").slice(0, 200),
        url: shareUrl,
      });
      onShare?.(post._id ?? post.id ?? "");
      return true;
    } catch (err) {
      return false;
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast("Link copiado para a área de transferência");
      onShare?.(post._id ?? post.id ?? "");
    } catch (err) {
      setToast("Falha ao copiar link");
    } finally {
      setShareOpen(false);
    }
  }

  function openWindow(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
    onShare?.(post._id ?? post.id ?? "");
    setShareOpen(false);
  }

  async function onShareClick() {
    const usedNative = await handleNativeShare();
    if (!usedNative) {
      setShareOpen((s) => !s);
    }
  }

  const whatsappText = encodeURIComponent(`${post.titulo ?? ""}\n\n${post.descricao ?? ""}\n\n${shareUrl}`);
  const twitterText = encodeURIComponent(`${post.titulo ?? ""} — ${shareUrl}`);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

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
              {avatar ? (
                <img src={`http://localhost:3001${avatar}`} alt={personName} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>{(personName || "U").charAt(0).toUpperCase()}</div>
              )}
            </button>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div className={styles.author}>{personName}</div>
              </div>

              <div className={styles.meta}>
                {/* <<< aqui mostramos o nome da organização (orgName) em vez do título >>> */}
                <span className={styles.title} id={`post-${post._id}-title`}>{orgName}</span>
                <span className={styles.dot}>•</span>
                <time className={styles.time}>{computeTimeAgo()}</time>
              </div>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div ref={shareRef} style={{ position: "relative" }}>
              <button
                className={styles.iconButton}
                onClick={onShareClick}
                aria-haspopup="menu"
                aria-expanded={shareOpen}
                aria-label={`Compartilhar publicação ${post._id ?? post.id}`}
                type="button"
              >
                <FiShare2 size={18} />
              </button>

              {shareOpen && (
                <div role="menu" aria-label="Opções de compartilhamento" className={styles.shareMenu}>
                  <button
                    className={styles.shareItem}
                    onClick={() => {
                      openWindow(`https://wa.me/?text=${whatsappText}`);
                    }}
                  >
                    <img src="/icons/whatsapp.svg" alt="" className={styles.shareIcon} /> WhatsApp
                  </button>

                  <button
                    className={styles.shareItem}
                    onClick={() => {
                      openWindow(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.titulo ?? "")}`);
                    }}
                  >
                    <img src="/icons/telegram.svg" alt="" className={styles.shareIcon} /> Telegram
                  </button>

                  <button
                    className={styles.shareItem}
                    onClick={() => {
                      openWindow(`${facebookUrl}`);
                    }}
                  >
                    <img src="/icons/facebook.svg" alt="" className={styles.shareIcon} /> Facebook
                  </button>

                  <button
                    className={styles.shareItem}
                    onClick={() => {
                      openWindow(`https://twitter.com/intent/tweet?text=${twitterText}`);
                    }}
                  >
                    <img src="/icons/twitter.svg" alt="" className={styles.shareIcon} /> Twitter
                  </button>

                  <div className={styles.shareDivider} />

                  <button className={styles.shareItem} onClick={handleCopyLink}>
                    <FiBookmark size={16} style={{ marginRight: 8 }} /> Copiar link
                  </button>
                </div>
              )}
            </div>

            <button
              className={styles.iconButton}
              onClick={() => onToggleSave?.(post._id ?? post.id ?? "")}
              aria-label={post.status ? "Remover dos salvos" : "Salvar publicação"}
              type="button"
            >
              {post.status ? <BsFillBookmarkFill size={18} /> : <FiBookmark size={18} />}
            </button>

            {isMine && (
              <>
                <button
                  className={styles.iconButton}
                  onClick={() => onEdit?.(post)}
                  aria-label="Editar postagem"
                  type="button"
                >
                  <FiEdit size={18} />
                </button>
                <button
                  className={styles.iconButton}
                  onClick={() => onDelete?.(post?._id ?? post.id ?? "")}
                  aria-label="Excluir postagem"
                  type="button"
                >
                  <FiTrash2 size={18} />
                </button>
              </>
            )}
          </div>
        </header>

        <div className={styles.body}>
          <p className={styles.description}>{post.descricao}</p>
          {post.image && <img src={`http://localhost:3001${post.image}`} alt={post.titulo ?? ""} className={styles.image} />}
        </div>
      </article>

      <ProfileModal visible={modalOpen} onClose={() => setModalOpen(false)} profile={post?.usuario} />

      {/* toast */}
      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          <FiCheck style={{ marginRight: 8 }} /> {toast}
        </div>
      )}
    </>
  );
}
