"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Importe o hook de navegação
import styles from "./forgotPassword.module.css";
import logo from '../../../public/logo4.png'; // Importe o logo

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter(); // Instancie o router

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setMessage("Por favor, insira seu email.");
    setLoading(true);
    setMessage("");
    // Simulação de envio
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setMessage("Link de redefinição enviado para seu email!");
  };

  return (
    <main className={styles.wrapper}>
      <section className={styles.loginBox}>
        <div className={styles.brand}>
          <div className={styles.logo} style={{ width: 300, height: 150 }}>
            <Image
              alt="Logo"
              src={logo}
              width={300}
              height={300}
              style={{
                objectFit: 'contain',
                backgroundColor: '#ffffff',
              }}
            />
          </div>
          <h1 className={styles.heading}>Esqueci minha senha</h1>
          <p className={styles.subheading}>Digite seu email para receber um link de redefinição</p>
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

          {message && <p className={styles.message}>{message}</p>}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primary}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Link"}
            </button>
          </div>

          <div className={styles.footer}>
            <span
              className={styles.link}
              onClick={() => router.push('/?view=login')} // Volte ao login via query
            >
              Voltar ao login
            </span>
          </div>
        </form>
      </section>

      <aside className={styles.sidePanel}>
        <h2 className={styles.sideTitle}>Redefina sua senha</h2>
        <p className={styles.sideText}>
          Receba um link seguro para criar uma nova senha e continue conectado à nossa comunidade.
        </p>
      </aside>
    </main>
  );
}
