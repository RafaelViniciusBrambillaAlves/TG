"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import { IoHomeSharp } from "react-icons/io5";
import { FaWarehouse } from "react-icons/fa";
import { IoIosAlert } from "react-icons/io";
import { MdFastfood } from "react-icons/md";
import { BsFillPeopleFill } from "react-icons/bs";
import Image from "next/image";
import logo from "../../public/logo3.jpg";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type NavItem = { key: string; label: string; icon: React.ReactNode };

const NAV_ITEMS: NavItem[] = [
  { key: "publicacoes", label: "Publicações", icon: <IoHomeSharp /> },
  { key: "centros", label: "Centros", icon: <FaWarehouse /> },
  { key: "emergencias", label: "Emergências", icon: <IoIosAlert /> },
  { key: "necessidades", label: "Necessidades", icon: <MdFastfood /> },
  { key: "voluntarios", label: "Voluntários", icon: <BsFillPeopleFill /> },
];

type HeaderProps = {
  active: string;
  onChangeActive: (key: string) => void;
  onSearch?: (query: string) => void;
};

export default function Header({
  active,
  onChangeActive,
  onSearch,
}: HeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const avatarButtonRef = useRef<HTMLButtonElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const composingRef = useRef(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleAvatarKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsDropdownOpen((s) => !s);
    }
  }

  function openProfile() {
    setIsDropdownOpen(false);
    onChangeActive("perfil");
  }

  function openSettings() {
    setIsDropdownOpen(false);
    onChangeActive("configuracoes");
  }

  function logout() {
    setIsDropdownOpen(false);
    localStorage.removeItem("usuario");
    router.push("/?view=login");
    return window.location.assign("/?view=login");
  }

  // debounce + safety wrapper
  useEffect(() => {
    if (!onSearch) return;
    // se estiver compondo (IME) não dispara
    if (composingRef.current) return;
    const t = setTimeout(() => {
      try {
        onSearch(searchQuery);
      } catch (err) {
        console.warn("onSearch callback falhou:", err);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery, onSearch]);

  // manda imediatamente quando o usuário aperta Enter
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      try {
        onSearch?.(searchQuery);
      } catch (err) {
        console.warn("onSearch immediate failed:", err);
      }
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.leftGroup}>
          <div className={styles.logoSquare} role="img" aria-label="LOGO">
            <Image
              alt="LOGO"
              src={logo}
              sizes="100vw"
              style={{
                objectFit: "cover",
                position: "-moz-initial",
                borderRadius: "8%",
              }}
            />
          </div>

          <div className={styles.search}>
            <svg
              className={styles.searchIcon}
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden
            >
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle
                cx="11"
                cy="11"
                r="6"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
              />
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Pesquisar"
              aria-label="Pesquisar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => (composingRef.current = true)}
              onCompositionEnd={() => {
                composingRef.current = false;
                // dispara imediatamente após composição terminar
                onSearch?.(searchQuery);
              }}
            />
          </div>
        </div>

        <nav
          className={styles.nav}
          aria-label="Navegação principal"
          ref={wrapperRef}
        >
          {NAV_ITEMS.map((it) => {
            const isActive = it.key === active;
            return (
              <button
                key={it.key}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                onClick={() => onChangeActive(it.key)}
                aria-pressed={isActive}
                aria-label={it.label}
                type="button"
              >
                <div className={styles.iconBox}>{it.icon}</div>
                <div className={styles.label}>{it.label}</div>
                <span className={styles.indicator} aria-hidden />
              </button>
            );
          })}

          <div className={styles.avatarNavWrapper}>
            <button
              ref={avatarButtonRef}
              className={`${styles.navItem} ${active === "perfil" ? styles.active : ""}`}
              onClick={() => setIsDropdownOpen((s) => !s)}
              onKeyDown={handleAvatarKeyDown}
              aria-label="Usuário"
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
              type="button"
            >
              <div className={styles.iconBox}>
                <div className={styles.avatarWrap}>
                  {user && (
                    <img
                      src={`${process.env.API_URL}${user?.image}`}
                      alt="Perfil"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              </div>
              <div className={styles.label}>Eu</div>
              <span className={styles.indicator} aria-hidden />
            </button>

            {isDropdownOpen && (
              <div
                className={styles.dropdown}
                role="menu"
                aria-label="Menu do usuário"
              >
                <button
                  className={styles.dropdownItem}
                  role="menuitem"
                  type="button"
                  onClick={openProfile}
                >
                  Ver Perfil
                </button>

                <button
                  className={styles.dropdownItem}
                  role="menuitem"
                  type="button"
                  onClick={openSettings}
                >
                  Configurações
                </button>

                <button
                  className={`${styles.dropdownItem} ${styles.logout}`}
                  role="menuitem"
                  type="button"
                  onClick={logout}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
