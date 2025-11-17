"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Importe o hook de navegação
import styles from "./loginPage.module.css";
import { FcGoogle } from "react-icons/fc";
import { SetAuthenticationToken, signInRequest } from "@/services/auth";
import logo from "../../../public/logo4.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Instancie o router

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      console.log(email);
      console.log(password);
      const data = await signInRequest({
        email,
        password,
      });

      SetAuthenticationToken(data.token);
      localStorage.setItem(`usuario`, JSON.stringify(data));
      router.push("/?view=dashboard");
      return window.location.assign("/?view=dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className={styles.wrapper}>
      <section className={styles.loginBox}>
        <div className={styles.brand}>
          <div className={styles.logo} style={{ width: 300, height: 150 }}>
            <Image
              alt="Logo"
              src="/logo4.png"
              width={300}
              height={300}
              style={{
                objectFit: "contain",
                backgroundColor: "#ffffff",
              }}
            />
          </div>
          <h1 className={styles.heading}>Acesse sua conta</h1>
          <p className={styles.subheading}>
            Conecte-se com a comunidade global
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Email
            <input
              type="email"
              className={styles.input}
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.label}>
            Senha
            <input
              type="password"
              className={styles.input}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <div className={styles.footer}>
            <span
              className={styles.link}
              onClick={() => router.push("/?view=forgot-password")} // Navegue para a página de esqueci senha
            >
              Esqueci minha senha
            </span>
            {/* <span className={styles.signup}>
              Não tem conta? <strong>Criar conta</strong>
            </span> */}
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <button
              type="button"
              className={styles.google}
              onClick={() => alert("Login com Google (simulado)")}
            >
              <FcGoogle size={20} />
              Entrar com Google
            </button>
          </div>
        </form>
      </section>

      <aside className={styles.sidePanel}>
        <h2 className={styles.sideTitle}>Bem-vindo ao Voluntaree</h2>
        <p className={styles.sideText}>
          Conecte-se, coordene e colabore para fazer a diferença em situações de
          emergência. Junte-se a voluntários, organize recursos e participe de
          ações que salvam vidas.
        </p>
      </aside>
    </main>
  );
}
