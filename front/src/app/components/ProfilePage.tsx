"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./profilePage.module.css";
import api from "@/services/api";

export type ONG = {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
  description?: string;
};

export type UserProfile = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  organizations?: ONG[];
  image?: string;
  bio?: string;
  role?: { nome_perfil?: string };
  password?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  // editData é parcial — facilita trabalhar com campos opcionais
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setEditData(parsed);
      } catch {}
    }
  }, []);

  // sempre sincroniza editData quando user muda (ex: após salvar)
  useEffect(() => {
    setEditData(user ?? {});
  }, [user]);

  const handleChange = (key: keyof UserProfile, value: any) => {
    setEditData((p) => ({ ...(p ?? {}), [key]: value }));
  };

  const triggerAvatarPicker = () => fileInputRef.current?.click();

  const onAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    // client-side size check
    const MAX = 8 * 1024 * 1024;
    if (f.size > MAX) {
      alert("Arquivo muito grande. Máx 8MB.");
      e.currentTarget.value = "";
      return;
    }
    setAvatarFile(f);
    const url = URL.createObjectURL(f);
    setEditData((p) => ({ ...(p ?? {}), image: url }));
  };

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/v1/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const data = res.data ?? {};
    if (typeof data === "string") return data;
    if (data.url) return data.url;
    if (data.fileId) return `/api/v1/files/${data.fileId}`;
    if (data.file?._id) return `/api/v1/files/${data.file._id}`;
    if (data._id) return `/api/v1/files/${data._id}`;
    throw new Error("Resposta de upload inválida");
  }

  async function saveProfile() {
    if (!editData?.name?.trim() || !editData?.email?.trim()) {
      alert("Nome e email são obrigatórios.");
      return;
    }
    if (!user?._id) {
      alert("Usuário não identificado.");
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = editData.image;

      // se tiver arquivo selecionado, faz upload e substitui avatarUrl pelo retorno
      if (avatarFile) {
        try {
          avatarUrl = await uploadFile(avatarFile);
        } catch (err) {
          console.error("Falha upload avatar:", err);
          alert("Falha ao enviar avatar. Tente novamente.");
          setLoading(false);
          return;
        }
      }

      const payload: any = {
        nome: editData.name,
        email: editData.email,
        telefone: editData.phone,
        bio: editData.bio,
        image: avatarUrl, // seu model usa 'image' / 'avatarUrl' interchangeably; backend deve tratar
      };

      const res = await api.put(`/api/v1/usuarios/usuarios/${user._id}`, payload);
      const updated = res.data ?? {};

      const normalized = {
        ...user,
        ...updated,
        name: updated.nome ?? updated.name ?? editData.name,
        email: updated.email ?? editData.email,
        phone: updated.telefone ?? updated.phone ?? editData.phone,
        avatarUrl: updated.avatarUrl ?? updated.image ?? avatarUrl,
        bio: updated.bio ?? editData.bio,
        organizations: updated.organizations ?? user?.organizations,
        role: updated.role ?? user?.role,
        _id: updated._id ?? user._id,
      };

      localStorage.setItem("usuario", JSON.stringify(normalized));
      setUser(normalized as UserProfile);
      setEditData(normalized);
      setAvatarFile(null);
      setIsEditing(false);
      alert("Perfil atualizado com sucesso.");
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao salvar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    if (!user?._id) return alert("Usuário não identificado.");
    if (!pwd.current || !pwd.next || !pwd.confirm) {
      return alert("Preencha todos os campos de senha.");
    }
    if (pwd.next.length < 8) {
      return alert("A nova senha precisa ter no mínimo 8 caracteres.");
    }
    if (pwd.next !== pwd.confirm) {
      return alert("A nova senha e a confirmação não coincidem.");
    }

    setLoading(true);
    try {
      // rota que vamos criar no backend
      await api.put(`/api/v1/usuarios/${user._id}/password`, {
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });
      alert("Senha alterada com sucesso.");
      setPwd({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message ?? "Falha ao alterar senha.");
    } finally {
      setLoading(false);
    }
  }

  const confirmDelete = () => setShowDeleteConfirm(true);
  const deleteAccount = () => {
    setShowDeleteConfirm(false);
    alert("Conta excluída (mock).");
  };

  const cls = (variant?: string) =>
    [styles.btn, variant ? (styles as any)[variant] : null].filter(Boolean).join(" ");

  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <div className={styles.avatarBox}>
          <img
            src={user?.image ? `http://localhost:3001${user?.image}` : editData.image}
            alt="avatar"
            className={styles.avatar}
          />
          <div className={styles.roleBadge}>{user?.role?.nome_perfil}</div>
        </div>

        <div className={styles.basicInfo}>
          {isEditing ? (
            <>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  ref={fileInputRef as any}
                  type="file"
                  accept="image/*"
                  onChange={onAvatarSelect}
                  style={{ display: "none" }}
                />
                <button type="button" className={styles.btn} onClick={triggerAvatarPicker}>
                  Trocar avatar
                </button>
                {avatarFile && <span>{avatarFile.name}</span>}
              </div>

              <input
                className={styles.input}
                value={editData.name ?? ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nome completo"
              />
              <input
                className={styles.input}
                value={editData.email ?? ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@exemplo.com"
              />
              <input
                className={styles.input}
                value={editData.phone ?? ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(99) 99999-9999"
              />
              <textarea
                className={styles.textarea}
                rows={3}
                value={editData.bio ?? ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Fale algo sobre você"
              />
            </>
          ) : (
            <>
              <h1 className={styles.name}>{user?.name}</h1>
              <p className={styles.email}>{user?.email}</p>
              {user?.phone && <p className={styles.meta}>{user?.phone}</p>}
              {user?.organizations && <p className={styles.org}>{user?.organizations[0]?.name}</p>}
              {user?.bio && <p className={styles.bio}>{user?.bio}</p>}
            </>
          )}
        </div>

        <div className={styles.cardActions}>
          {!isEditing ? (
            <button className={cls("primary")} onClick={() => setIsEditing(true)}>
              Editar perfil
            </button>
          ) : (
            <>
              <button className={cls("primary")} onClick={saveProfile} disabled={loading}>
                Salvar
              </button>
              <button className={cls("secondary")} onClick={() => { setEditData(user); setIsEditing(false); }}>
                Cancelar
              </button>
            </>
          )}
        </div>

        {isEditing && (
          <div className={styles.secSectionInline}>
            <h3 className={styles.secTitle}>Alterar senha</h3>
            <input
              className={styles.input}
              type="password"
              placeholder="Senha atual"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Nova senha"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Confirmar nova senha"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
            />
            <div className={styles.pwdActions}>
              <button className={cls("primary")} onClick={changePassword} disabled={loading}>
                Atualizar senha
              </button>
              <button className={cls("ghost")} onClick={() => setPwd({ current: "", next: "", confirm: "" })}>
                Limpar
              </button>
            </div>
          </div>
        )}

        {user?.organizations?.map((e) => {
          return (
            <div className={styles.orgCard} key={e._id ?? e.id}>
              <div className={styles.orgHeader}>
                <img src={e.logo} alt={e.name} className={styles.orgAvatar} />
                <div>
                  <div className={styles.orgName}>{e.name}</div>
                  <div className={styles.orgMeta}>{e.email}</div>
                </div>
              </div>
              <p className={styles.orgDesc}>{e.description}</p>
              <div className={styles.orgActions}>
                <button className={cls("ghost")} onClick={() => window.open(e.website, "_blank")}>
                  Ver ONG
                </button>
              </div>
            </div>
          );
        })}

        <div className={styles.bottomActions}>
          <button className={cls("danger")} onClick={confirmDelete}>
            Excluir conta
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h3>Confirmar exclusão de conta</h3>
            <p>Esta ação é irreversível. Todos os dados serão removidos. Tem certeza?</p>
            <div className={styles.modalActions}>
              <button className={cls("secondary")} onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </button>
              <button className={cls("danger")} onClick={deleteAccount}>
                Excluir conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
