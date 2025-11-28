// app/components/Feed.tsx
"use client";

import React, { useEffect, useState } from "react";
import Composer from "./Composer";
import PostCard from "./PostCard";
import { Post as PostType } from "@/app/mocks";
import styles from "./feed.module.css";
import EditPostModal from "./EditPostModal";
import { getPost, Publicidade } from "@/hooks/getPost";
import api from "@/services/api";
import { UserProfile } from "./ProfilePage";
import classNames from "classnames";

type FeedProps = {
  posts?: Publicidade[] | PostType[];
  onCreate?: () => void;
  onUpdatePost?: (updated: PostType) => void; // <- nova
  onRefresh?: () => void; // <- opcional: força re-fetch no parent
};

export default function Feed({
  posts: postsFromProps,
  onCreate,
  onUpdatePost,
  onRefresh,
}: FeedProps) {
  const [user, setUser] = useState<UserProfile>();

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  const [internalPosts, setInternalPosts] = useState<
    Publicidade[] | PostType[] | undefined
  >(postsFromProps);
  const posts = postsFromProps ?? internalPosts; // usa prop se existir, senão internal

  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "24h" | "week">("all");
  const [editingPost, setEditingPost] = useState<PostType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // se não recebeu posts por prop, busca internamente (comportamento antigo)
  useEffect(() => {
    if (postsFromProps) return; // parent está controlando posts
    let mounted = true;
    getPost()
      .then((data) => {
        if (!mounted) return;
        setInternalPosts(data);
      })
      .catch((err) => {
        console.warn("Falha ao carregar posts no Feed:", err);
      });
    return () => {
      mounted = false;
    };
  }, [postsFromProps]);

  async function handleCreate(text: string, file?: File | null) {
    try {
      const usuario = JSON.parse(localStorage.getItem(`usuario`) || "{}");
      let imageUrl: string | undefined = undefined;

      if (file) {
        const form = new FormData();
        form.append("file", file);

        const uploadRes = await api.post("/api/v1/upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = uploadRes.data?.url;
      }
      const newPost: Publicidade = {
        titulo: text,
        descricao: text,
        image: imageUrl,
        usuario_id: usuario._id,
      };

      await api({
        url: "/api/v1/publicacao/publicidades",
        method: "POST",
        data: newPost,
      });

      onCreate?.();
    } catch (error) {
      console.log("Erro ao criar publicação:", error);
    }
  }

  function toggleSave(id: string) {
    // placeholder
  }

  function handleShare(id: string) {
    // placeholder
  }

  async function handleDelete(id: string) {
    await api({
      url: "/api/v1/publicacao/publicidades/" + id,
      method: "DELETE",
    });

    // se parent controla posts, não mexe aqui — apenas instrui o usuário/developer
    // aqui lidamos com internalPosts caso exista

    setInternalPosts((s) => s?.filter((p: any) => p._id !== id));
    getPost()
      .then((data) => {
        setInternalPosts(data);
      })
      .catch((err) => {
        console.warn("Falha ao carregar posts no Feed:", err);
      });
  }

  function handleEdit(post: PostType) {
    setEditingPost(post);
    setShowEditModal(true);
  }

  async function handleUpdatePost(updated: PostType) {
    try {
      let imageUrl: string | undefined = undefined;

      if (updated.image) {
        const form = new FormData();
        form.append("file", updated.image);

        const uploadRes = await api.post("/api/v1/upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = uploadRes.data?.url;
      }
      const newPost: Publicidade = {
        titulo: updated.titulo,
        descricao: updated.descricao,
        image: imageUrl,
        usuario_id: updated.usuario,
      };

      await api({
        url: "/api/v1/publicacao/publicidades/" + updated._id,
        method: "PUT",
        data: newPost,
      });

      // se parent controla posts: informar o parent (ele fará o setPosts)
      if (postsFromProps) {
        if (onUpdatePost) {
          onUpdatePost(updated); // atualiza só o item no parent
        } else if (onRefresh) {
          onRefresh(); // força re-fetch completo
        } else {
          console.warn(
            "parent controla posts mas não passou onUpdatePost nem onRefresh",
          );
        }
        return;
      }

      // caso interno (fallback), atualiza localmente
      setInternalPosts((s) =>
        s?.map((p: any) => (p._id === updated._id ? updated : p)),
      );
    } catch (err) {
      console.error("Erro ao atualizar post:", err);
    }
  }

  // se posts ainda undefined (fallback) mostra nada até carregamento
  const filteredPosts = (posts ?? []).filter((p: any) => {
    // filtro "Minhas" (propriedade)
    if (filter === "mine" && p.usuario?._id !== user?._id) return false;

    // --- filtro horário ---
    if (timeFilter && timeFilter !== "all") {
      // tenta extrair uma data em vários campos comuns
      const raw =
        p.data_criacao ??
        p.createdAt ??
        p.created_at ??
        p.created ??
        p.date ??
        null;

      if (!raw) {
        // sem data: não passa quando um filtro temporal está ativo
        return false;
      }

      const postDate = new Date(raw);
      if (Number.isNaN(postDate.getTime())) {
        // formato inválido: rejeita
        return false;
      }

      const now = new Date();
      const ageMs = now.getTime() - postDate.getTime();

      const MS_PER_HOUR = 1000 * 60 * 60;
      const MS_PER_DAY = MS_PER_HOUR * 24;

      if (timeFilter === "24h") {
        if (ageMs > MS_PER_DAY) return false;
      } else if (timeFilter === "week") {
        if (ageMs > MS_PER_DAY * 7) return false;
      }
      // se entrar aqui, passou no filtro horário
    }

    // passou em todos os filtros
    return true;
  });

  return (
    <section className={styles.wrap}>
      <Composer onCreate={handleCreate} />

      {/* filtros */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <button
            type="button"
            aria-pressed={filter === "all"}
            className={classNames({ [styles.activeFilter]: filter === "all" })}
            onClick={(e) => {
              e.preventDefault();
              // console.debug("set filter all");
              setFilter("all");
            }}
          >
            Todas
          </button>
          <button
            type="button"
            aria-pressed={filter === "mine"}
            className={classNames({ [styles.activeFilter]: filter === "mine" })}
            onClick={(e) => {
              e.preventDefault();
              // console.debug("set filter mine");
              setFilter("mine");
            }}
          >
            Minhas
          </button>
        </div>

        <div className={styles.filterGroup}>
          <button
            type="button"
            aria-pressed={timeFilter === "all"}
            className={classNames({
              [styles.activeFilter]: timeFilter === "all",
            })}
            onClick={(e) => {
              e.preventDefault();
              // console.debug("time all");
              setTimeFilter("all");
            }}
          >
            Todas
          </button>
          <button
            type="button"
            aria-pressed={timeFilter === "24h"}
            className={classNames({
              [styles.activeFilter]: timeFilter === "24h",
            })}
            onClick={(e) => {
              e.preventDefault();
              // console.debug("time 24h");
              setTimeFilter("24h");
            }}
          >
            Últimas 24h
          </button>
          <button
            type="button"
            aria-pressed={timeFilter === "week"}
            className={classNames({
              [styles.activeFilter]: timeFilter === "week",
            })}
            onClick={(e) => {
              e.preventDefault();
              // console.debug("time week");
              setTimeFilter("week");
            }}
          >
            Última semana
          </button>
        </div>
      </div>

      <div style={{ height: 8 }} />

      <div>
        {filteredPosts?.map((p: any) => (
          <PostCard
            key={p._id}
            post={p}
            currentUser={user}
            onToggleSave={toggleSave}
            onShare={handleShare}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        <EditPostModal
          post={editingPost}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdatePost}
        />
      </div>
    </section>
  );
}
