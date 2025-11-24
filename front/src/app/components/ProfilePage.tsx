// profilePage.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./profilePage.module.css";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

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
  username?: string;
  email?: string;
  phone?: string;
  organizations?: ONG[];
  image?: string;
  bio?: string;
  role?: { nome_perfil?: string };
  password?: string;
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setEditData(user ?? {});
  }, [user]);

  const handleChange = (key: keyof UserProfile, value: any) => {
    setEditData((p) => ({ ...(p ?? {}), [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const triggerAvatarPicker = () => fileInputRef.current?.click();

  const onAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const MAX = 8 * 1024 * 1024;
    if (f.size > MAX) {
      setErrors((prev) => ({ ...prev, avatar: "Arquivo muito grande. Máx 8MB." }));
      e.currentTarget.value = "";
      return;
    }
    setAvatarFile(f);
    const url = URL.createObjectURL(f);
    setEditData((p) => ({ ...(p ?? {}), image: url }));
    setErrors((prev) => ({ ...prev, avatar: "" }));
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

  // Normaliza telefone: aceita "18999999999" ou "(18) 99999-9999" etc.
  const formatPhoneFromInput = (raw?: string) => {
    if (!raw) return "";
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 10) {
      // (99) 9999-9999
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11) {
      // (99) 99999-9999
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    // retorna original se não for 10/11 dígitos (tratamento de erro acontece onde chama)
    return raw;
  };

  async function saveProfile() {
     setLoading(true);
     try {
       let avatarUrl = editData.image;

       if (avatarFile) {
         try {
           avatarUrl = await uploadFile(avatarFile);
         } catch (err) {
           console.error("Falha upload avatar:", err);
           setErrors({ avatar: "Falha ao enviar avatar. Tente novamente." });
           setLoading(false);
           return;
         }
       }

       const formattedPhone = editData.phone ? formatPhoneFromInput(editData.phone) : undefined;

       const payload: any = {
         nome: editData.name,
         email: editData.email,
         telefone: formattedPhone ?? editData.phone,
         bio: editData.bio,
         image: avatarUrl,
       };

       const res = await api.put(`/api/v1/usuarios/usuarios/${user._id}`, payload);
       const updated = res.data ?? {};

       // Normaliza os dados retornados do backend
       const normalized: UserProfile = {
         _id: updated._id ?? user?._id,
         name: updated.nome ?? updated.name ?? user?.name,
         username: updated.nome ?? updated.username ?? user?.username,
         email: updated.email ?? user?.email,
         phone: updated.telefone ?? updated.phone ?? formattedPhone ?? user?.phone,
         image: updated.avatarUrl ?? updated.image ?? avatarUrl ?? user?.image,
         bio: updated.bio ?? user?.bio,
         organizations: updated.organizations ?? user?.organizations ?? [],
         role: updated.role ?? user?.role,
       };

       // Atualiza localStorage
       localStorage.setItem("usuario", JSON.stringify(normalized));

       // Atualiza estados locais
       updateUser(normalized);
       setEditData(normalized);
       setAvatarFile(null);
       setIsEditing(false);
       setErrors({});

       // Dispara evento customizado para outros componentes que possam estar escutando
       window.dispatchEvent(new CustomEvent('userUpdated', { detail: normalized }));

       alert("Perfil atualizado com sucesso.");
     } catch (err: any) {
       console.error(err);
       setErrors({ general: err?.response?.data?.message ?? "Ocorreu um erro ao salvar o perfil." });
     } finally {
       setLoading(false);
     }
   }

  async function changePassword() {
    const newErrors: { [key: string]: string } = {};
    if (!pwd.current) newErrors.current = "Senha atual é obrigatória.";
    if (!pwd.next) newErrors.next = "Nova senha é obrigatória.";
    if (!pwd.confirm) newErrors.confirm = "Confirmação é obrigatória.";
    if (pwd.next && pwd.next.length < 8) newErrors.next = "A nova senha precisa ter no mínimo 8 caracteres.";
    if (pwd.next && pwd.confirm && pwd.next !== pwd.confirm) newErrors.confirm = "A nova senha e a confirmação não coincidem.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user?._id) return alert("Usuário não identificado.");

    setLoading(true);
    try {
      await api.put(`/api/v1/usuarios/${user._id}/password`, {
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });
      alert("Senha alterada com sucesso.");
      setPwd({ current: "", next: "", confirm: "" });
      setErrors({});
    } catch (err: any) {
      console.error(err);
      setErrors({ password: err?.response?.data?.message ?? "Falha ao alterar senha." });
    } finally {
      setLoading(false);
    }
  }

  const confirmDelete = () => setShowDeleteConfirm(true);
  const deleteAccount = () => {
    setShowDeleteConfirm(false);
    alert("Conta excluída.");
  };

  const cls = (variant?: string) =>
    [styles.btn, variant ? (styles as any)[variant] : null].filter(Boolean).join(" ");

  // helper: formata telefone simples (se já tiver dado formato, não altera)
  const prettyPhone = (p?: string) => {
    if (!p) return "";
    // se já tiver parênteses, retorna
    if (p.includes("(") || p.includes("-")) return p;
    const digits = p.replace(/\D/g, "");
    if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return p;
  };

  // helper: full image url
  const resolveImage = (img?: string) => {
    if (!img) return "";
    if (/^https?:\/\//.test(img)) return img;
    if (img.startsWith("/")) {
      return `http://localhost:3001${img}`;
    }
    return img;
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.grid}>
        {/* Coluna Esquerda: Avatar e Info Básica */}
        <div className={styles.card}>
          <div className={styles.avatarBox}>
            <img
              src={editData.image ? resolveImage(editData.image) : editData.image || "/default-avatar.png"}
              alt="Avatar do usuário"
              className={styles.avatar}
            />
            <div className={styles.leftMeta}>
              <div className={styles.nameRow}>
                <h1 className={styles.name}>{user?.username || "Nome não informado"}</h1>
              </div>

              <div className={styles.smallMeta}>
                <div className={styles.contactLine}>
                  {user?.email && (
                    <a className={styles.contactLink} href={`mailto:${user.email}`}>
                      {user.email}
                    </a>
                  )}
                  {user?.phone && <span className={styles.contactPhone}>{prettyPhone(user.phone)}</span>}
                </div>

                {/* organização principal (se houver) */}
                {user?.organizations && user.organizations.length > 0 && (
                  <div className={styles.orgInfo}>
                    <span className={styles.orgLabel}>Organização:</span>
                    <span className={styles.orgValue}>{user.organizations[0].name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.basicInfo}>
            {!isEditing ? (
              <>
                {/* View profile simplificada e profissional */}
                <div className={styles.profileSummary}>
                  {user?.bio ? (
                    <p className={styles.bioLarge}>{user.bio}</p>
                  ) : (
                    <p className={styles.bioPlaceholder}>Sem bio — conte um pouco sobre você para que outros saibam quem você é.</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* edição: mantida igual */}
                <div className={styles.avatarEdit}>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarSelect} className={styles.fileInput} aria-label="Selecionar novo avatar" />
                  <div className={styles.avatarBtns}>
                    <button type="button" className={cls("outline")} onClick={triggerAvatarPicker}>
                      Trocar avatar
                    </button>
                  </div>
                  {errors.avatar && <p className={styles.error}>{errors.avatar}</p>}
                </div>
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
                  {loading ? "Salvando..." : "Salvar"}
                </button>
                <button
                  className={cls("secondary")}
                  onClick={() => {
                    setEditData(user);
                    setIsEditing(false);
                    setErrors({});
                  }}
                >
                  Cancelar
                </button>

                {/* botão Excluir aparece APENAS enquanto estiver editando */}
                <button
                  className={cls("danger")}
                  onClick={confirmDelete}
                  title="Excluir conta"
                  style={{ marginLeft: 8 }}
                >
                  Excluir conta
                </button>
              </>
            )}
          </div>
        </div>

        {/* Coluna Direita: Detalhes e Organizações */}
        <div className={styles.detailCard}>
          {isEditing && (
            <>
              <div className={styles.headerRow}>
                <div>
                  <h2 className={styles.heading}>Editar Perfil</h2>
                  <p className={styles.subheading}>Atualize suas informações pessoais</p>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.leftCol}>
                  <div>
                    <label className={styles.label} htmlFor="name">Nome completo</label>
                    <input
                      id="name"
                      className={styles.input}
                      value={editData.username ?? ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Nome completo"
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && <p id="name-error" className={styles.error}>{errors.name}</p>}
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="email">Email</label>
                    <input
                      id="email"
                      className={styles.input}
                      value={editData.email ?? ""}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="email@exemplo.com"
                      type="email"
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && <p id="email-error" className={styles.error}>{errors.email}</p>}
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="phone">Telefone</label>
                    <input
                      id="phone"
                      className={styles.input}
                      value={editData.phone ?? ""}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="(99) 99999-9999"
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                    />
                    {errors.phone && <p id="phone-error" className={styles.error}>{errors.phone}</p>}
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      className={styles.textarea}
                      rows={3}
                      value={editData.bio ?? ""}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      placeholder="Fale algo sobre você"
                    />
                  </div>
                </div>
              </div>

              <hr className={styles.sep} />

              <div className={styles.secSection}>
                <h3 className={styles.secTitle}>Alterar senha</h3>
                <p className={styles.secDesc}>Mantenha sua conta segura com uma senha forte.</p>
                <div className={styles.pwdRow}>
                  <div>
                    <label className={styles.label} htmlFor="current-pwd">Senha atual</label>
                    <input
                      id="current-pwd"
                      className={styles.input}
                      type="password"
                      placeholder="Senha atual"
                      value={pwd.current}
                      onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                      aria-describedby={errors.current ? "current-error" : undefined}
                    />
                    {errors.current && <p id="current-error" className={styles.error}>{errors.current}</p>}
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="new-pwd">Nova senha</label>
                    <input
                      id="new-pwd"
                      className={styles.input}
                      type="password"
                      placeholder="Nova senha"
                      value={pwd.next}
                      onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                      aria-describedby={errors.next ? "next-error" : undefined}
                    />
                    {errors.next && <p id="next-error" className={styles.error}>{errors.next}</p>}
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="confirm-pwd">Confirmar nova senha</label>
                    <input
                      id="confirm-pwd"
                      className={styles.input}
                      type="password"
                      placeholder="Confirmar nova senha"
                      value={pwd.confirm}
                      onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                      aria-describedby={errors.confirm ? "confirm-error" : undefined}
                    />
                    {errors.confirm && <p id="confirm-error" className={styles.error}>{errors.confirm}</p>}
                  </div>
                </div>
                <div className={styles.pwdActions}>
                  <button className={cls("primary")} onClick={changePassword} disabled={loading}>
                    {loading ? "Atualizando..." : "Atualizar senha"}
                  </button>
                  <button
                    className={cls("ghost")}
                    onClick={() => {
                      setPwd({ current: "", next: "", confirm: "" });
                      setErrors({});
                    }}
                  >
                    Limpar
                  </button>
                </div>
                {errors.password && <p className={styles.error}>{errors.password}</p>}
              </div>
            </>
          )}

          {!isEditing && user?.organizations && user.organizations.length > 0 && (
            <>
              <div className={styles.headerRow}>
                <div>
                  <h2 className={styles.heading}>Organizações</h2>
                  <p className={styles.subheading}>ONGs associadas ao seu perfil</p>
                </div>
              </div>
              {user.organizations.map((e) => (
                <div className={styles.orgCard} key={e._id ?? e.id}>
                  <div className={styles.orgHeader}>
                    <img
                      src={e.logo || "/default-org-logo.png"}
                      alt={`Logo de ${e.name}`}
                      className={styles.orgAvatar}
                    />
                    <div>
                      <div className={styles.orgName}>{e.name}</div>
                      <div className={styles.orgMeta}>{e.email}</div>
                    </div>
                  </div>
                  <p className={styles.orgDesc}>{e.description || "Descrição não disponível."}</p>
                  <div className={styles.orgActions}>
                    <button
                      className={cls("ghost")}
                      onClick={() => window.open(e.website, "_blank")}
                      aria-label={`Visitar site de ${e.name}`}
                    >
                      Ver ONG
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className={styles.modal}>
            <h3 id="delete-title">Confirmar exclusão de conta</h3>
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
