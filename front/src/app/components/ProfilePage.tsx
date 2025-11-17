"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./profilePage.module.css";
import { MOCK_ONGS, ONG } from "@/app/mocks";

export type UserProfile = {
  _id: String;
  name: string;
  email: string;
  phone?: string;
  organizations: ONG[];
  avatarUrl?: string;
  bio?: string;
  role: {
    nome_perfil: String;
  };
  password?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>();

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);
  // const [user, setUser] = useState<UserProfile>({
  //   name: "Rafael Brambilla",
  //   email: "rafael@example.com",
  //   phone: "(17) 99939-1428",
  //   password: "",
  //   organization: "Abrigo Esperança",
  //   avatarUrl: "https://i.pravatar.cc/200?img=5",
  //   bio: "Coordenador de projetos sociais com foco em crianças e famílias em vulnerabilidade.",
  //   role: "Administrador",
  // });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserProfile>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setEditData(user);
  }, [user]);

  const handleChange = <K extends keyof UserProfile>(key: K, value: string) => {
    setEditData((p) => ({ ...p, [key]: value }));
  };

  const triggerAvatarPicker = () => fileInputRef.current?.click();

  const onAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setAvatarFile(f);
    setEditData((p) => ({ ...p, avatarUrl: URL.createObjectURL(f) }));
  };

  const saveProfile = () => {
    if (!editData.name?.trim() || !editData.email?.trim()) {
      alert("Nome e email são obrigatórios.");
      return;
    }
    setUser(editData);
    setIsEditing(false);
    setAvatarFile(null);
    alert("Perfil atualizado (mock).");
  };

  const cancelEdit = () => {
    setEditData(user);
    setAvatarFile(null);
    setPwd({ current: "", next: "", confirm: "" });
    setIsEditing(false);
  };

  const changePassword = () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) {
      alert("Preencha todos os campos de senha.");
      return;
    }
    if (pwd.next.length < 8) {
      alert("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      alert("A nova senha e a confirmação não coincidem.");
      return;
    }
    alert("Senha alterada com sucesso (mock).");
    setPwd({ current: "", next: "", confirm: "" });
  };

  const confirmDelete = () => setShowDeleteConfirm(true);
  const deleteAccount = () => {
    setShowDeleteConfirm(false);
    alert("Conta excluída (mock).");
  };

  const cls = (variant?: string) =>
    [styles.btn, variant ? (styles as any)[variant] : null]
      .filter(Boolean)
      .join(" ");

  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <div className={styles.avatarBox}>
          <img
            src={editData?.avatarUrl ?? user?.avatarUrl}
            alt="avatar"
            className={styles.avatar}
          />
          <div className={styles.roleBadge}>{user?.role?.nome_perfil}</div>
        </div>

        <div className={styles.basicInfo}>
          {isEditing ? (
            <>
              <input
                className={styles.input}
                value={editData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              <input
                className={styles.input}
                value={editData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              <input
                className={styles.input}
                value={editData.phone ?? ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              <textarea
                className={styles.textarea}
                rows={3}
                value={editData.bio ?? ""}
                onChange={(e) => handleChange("bio", e.target.value)}
              />
            </>
          ) : (
            <>
              <h1 className={styles.name}>{user?.name}</h1>
              <p className={styles.email}>{user?.email}</p>
              {user?.phone && <p className={styles.meta}>{user?.phone}</p>}
              {user?.organizations && (
                <p className={styles.org}>{user?.organizations[0]?.name}</p>
              )}
              {user?.bio && <p className={styles.bio}>{user?.bio}</p>}
            </>
          )}
        </div>

        <div className={styles.cardActions}>
          {!isEditing ? (
            <button
              className={cls("primary")}
              onClick={() => setIsEditing(true)}
            >
              Editar perfil
            </button>
          ) : (
            <>
              <button className={cls("primary")} onClick={saveProfile}>
                Salvar
              </button>
              <button className={cls("secondary")} onClick={cancelEdit}>
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
              <button className={cls("primary")} onClick={changePassword}>
                Atualizar senha
              </button>
              <button
                className={cls("ghost")}
                onClick={() => setPwd({ current: "", next: "", confirm: "" })}
              >
                Limpar
              </button>
            </div>
          </div>
        )}

        {user?.organizations.map((e) => {
          return (
            <div className={styles.orgCard} key={e.id}>
              <div className={styles.orgHeader}>
                <img src={e.logo} alt={e.name} className={styles.orgAvatar} />
                <div>
                  <div className={styles.orgName}>{e.name}</div>
                  <div className={styles.orgMeta}>{e.email}</div>
                </div>
              </div>
              <p className={styles.orgDesc}>{e.description}</p>
              <div className={styles.orgActions}>
                <button
                  className={cls("ghost")}
                  onClick={() => window.open(e.website, "_blank")}
                >
                  Ver ONG
                </button>
              </div>
            </div>
          );
        })}
        {/* {org && (
          <div className={styles.orgCard}>
            <div className={styles.orgHeader}>
              <img src={org.logo} alt={org.name} className={styles.orgAvatar} />
              <div>
                <div className={styles.orgName}>{org.name}</div>
                <div className={styles.orgMeta}>{org.email}</div>
              </div>
            </div>
            <p className={styles.orgDesc}>{org.description}</p>
            <div className={styles.orgActions}>
              <button className={cls("ghost")} onClick={() => window.open(org.website, "_blank")}>Ver ONG</button>
            </div>
          </div>
        )} */}

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
            <p>
              Esta ação é irreversível. Todos os dados serão removidos. Tem
              certeza?
            </p>
            <div className={styles.modalActions}>
              <button
                className={cls("secondary")}
                onClick={() => setShowDeleteConfirm(false)}
              >
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
