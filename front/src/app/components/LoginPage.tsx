"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./loginPage.module.css";
import { FcGoogle } from "react-icons/fc";
import { SetAuthenticationToken, signInRequest } from "@/services/auth";
import logo from "../../../public/logo4.png";
import { FiEye, FiEyeOff } from "react-icons/fi";

type Errors = {
  email?: string;
  password?: string;
  general?: string;
};

const LOCK_KEY = "login_lock";
const ATTEMPTS_KEY = "login_attempts";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [attempts, setAttempts] = useState<number>(() => {
    const s = localStorage.getItem(ATTEMPTS_KEY);
    return s ? Number(s) : 0;
  });

  const [lockUntil, setLockUntil] = useState<number>(() => {
    const s = localStorage.getItem(LOCK_KEY);
    return s ? Number(s) : 0;
  });

  const [countdown, setCountdown] = useState<number>(0);
  const formRef = useRef<HTMLFormElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const pwdRef = useRef<HTMLInputElement | null>(null);

  // countdown timer when locked
  useEffect(() => {
    let t: number | undefined;
    if (lockUntil && lockUntil > Date.now()) {
      const update = () => {
        const diff = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
        setCountdown(diff);
        if (diff <= 0) {
          setLockUntil(0);
          localStorage.removeItem(LOCK_KEY);
          setAttempts(0);
          localStorage.setItem(ATTEMPTS_KEY, "0");
          window.clearInterval(t);
        }
      };
      update();
      t = window.setInterval(update, 500);
    } else {
      setCountdown(0);
    }
    return () => window.clearInterval(t);
  }, [lockUntil]);

  // keep attempts in localStorage
  useEffect(() => {
    localStorage.setItem(ATTEMPTS_KEY, String(attempts));
  }, [attempts]);

  useEffect(() => {
    const s = localStorage.getItem(LOCK_KEY);
    if (s) setLockUntil(Number(s));
  }, []);

  const setLock = (ms = 60_000) => {
    const until = Date.now() + ms;
    setLockUntil(until);
    localStorage.setItem(LOCK_KEY, String(until));
  };

  const resetErrors = () => setErrors({});

  const validateBeforeSubmit = (): boolean => {
    const e: Errors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = "Digite um email válido.";
    if (!password || password.length === 0) e.password = "Digite sua senha.";
    setErrors(e);
    if (e.email) emailRef.current?.focus();
    else if (e.password) pwdRef.current?.focus();
    return Object.keys(e).length === 0;
  };

  const handleFailedAttempt = (field?: "email" | "password" | undefined, message?: string) => {
    setAttempts((a) => {
      const next = a + 1;
      // lock after 5 attempts
      if (next >= 5) {
        setLock(60_000); // bloqueia 60 segundos (ajuste se quiser)
        setErrors({ general: "Muitas tentativas. Tente novamente em 60 segundos." });
      } else {
        setErrors((prev) => ({ ...prev, [field ?? "general"]: message ?? "Email ou senha incorretos." }));
      }
      localStorage.setItem(ATTEMPTS_KEY, String(next));
      // add shake animation
      if (formRef.current) {
        formRef.current.classList.remove(styles.shake);
        // trigger reflow to restart animation
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        formRef.current.offsetWidth;
        formRef.current.classList.add(styles.shake);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      resetErrors();

      if (lockUntil && lockUntil > Date.now()) {
        setErrors({ general: `Login temporariamente bloqueado. Tente novamente em ${Math.ceil((lockUntil - Date.now())/1000)}s.` });
        return;
      }

      if (!validateBeforeSubmit()) return;

      setLoading(true);

      const data = await signInRequest({ email, password });

      // success
      SetAuthenticationToken(data.token);
      localStorage.setItem(`usuario`, JSON.stringify(data));
      // reset attempts on success
      setAttempts(0);
      localStorage.setItem(ATTEMPTS_KEY, "0");
      localStorage.removeItem(LOCK_KEY);
      router.push("/?view=dashboard");
      return window.location.assign("/?view=dashboard");
    } catch (err: any) {
      console.error("login error:", err);
      // padrão profissional: checar códigos HTTP quando disponíveis
      const status = err?.response?.status ?? err?.status;
      const msg = err?.response?.data?.message ?? err?.message ?? "Falha ao entrar.";

      if (status === 401) {
        // unauthorized - wrong email/password
        handleFailedAttempt("password", "Email ou senha incorretos.");
        pwdRef.current?.focus();
      } else if (status === 404) {
        // user not found
        handleFailedAttempt("email", "Usuário não encontrado. Verifique o email.");
        emailRef.current?.focus();
      } else if (msg?.toLowerCase?.().includes("password")) {
        handleFailedAttempt("password", "Senha incorreta.");
        pwdRef.current?.focus();
      } else if (msg?.toLowerCase?.().includes("user")) {
        handleFailedAttempt("email", "Usuário não encontrado.");
        emailRef.current?.focus();
      } else {
        // generic failure
        setErrors({ general: "Ocorreu um erro ao efetuar login. Tente novamente mais tarde." });
      }
    } finally {
      setLoading(false);
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

        <form ref={formRef} className={`${styles.form}`} onSubmit={handleSubmit} noValidate>
          <div aria-live="polite" className={styles.liveRegion}>
            {/* mensagens gerais */}
            {errors.general && <div className={styles.errorText}>{errors.general}</div>}
            {lockUntil && lockUntil > Date.now() && (
              <div className={styles.lockNotice}>
                Acesso temporariamente bloqueado — tente novamente em {countdown}s.
              </div>
            )}
          </div>

          <label className={styles.label}>
            Email
            <input
              ref={emailRef}
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && <div id="email-error" className={styles.errorMini}>{errors.email}</div>}
          </label>

          <label className={styles.label}>
            Senha
            <div className={styles.inputContainer}>
              <input
                ref={pwdRef}
                type={showPassword ? "text" : "password"}
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "pwd-error" : undefined}
              />
              <button
                type="button"
                className={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <div id="pwd-error" className={styles.errorMini}>{errors.password}</div>}
          </label>

          <div className={styles.footer}>
            <span
              className={styles.link}
              onClick={() => router.push("/?view=forgot-password")}
            >
              Esqueci minha senha
            </span>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={loading || (!!lockUntil && lockUntil > Date.now())}>
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
