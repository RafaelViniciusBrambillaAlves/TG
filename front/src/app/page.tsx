// app/page.tsx
"use client";

import React, { useMemo, useState, Suspense, lazy, useEffect } from "react";
import Header from "@/app/Header";
import Feed from "@/app/components/Feed";
import RightBar from "@/app/components/RightBar";
import CentersList from "@/app/components/CentersList";
import EmergenciesList from "@/app/components/EmergenciesList";
import NeedsList from "@/app/components/NeedsList";
import VolunteersList from "@/app/components/VolunteersList";
// ProfilePage será carregado dinamicamente para capturarmos erros
const ProfilePageLazy = lazy(() => import("@/app/components/ProfilePage"));
import CreateCenterModal from "@/app/components/CreateCenterModal";
import EditCenterModal from "@/app/components/EditCenterModal";
import CreateEmergencyModal from "@/app/components/CreateEmergencyModal";
import EditEmergencyModal from "@/app/components/EditEmergencyModal";
import CreateNeedModal from "@/app/components/CreateNeedModal";
import CreateVolunteerModal from "@/app/components/CreateVolunteerModal";
import OrganizationModal from "@/app/components/ViewOrganizationModal";

import styles from "./page.module.css";
const SettingsPage = lazy(() => import("@/app/components/SettingsPage"));

import Cookies from "js-cookie";

const LoginPageLazy = lazy(() => import("@/app/components/LoginPage"));
const ForgotPasswordPageLazy = lazy(
  () => import("@/app/components/ForgotPasswordPage"),
);

import {
  MOCK_CENTERS,
  MOCK_EMERGENCIES,
  MOCK_NEEDS,
  MOCK_VOLUNTEERS,
  Center,
  Emergency,
  Need,
  Volunteer,
  ONG,
} from "@/app/mocks";
import { Centro, getCentros } from "@/hooks/getCentros";
import { Emergencia, getEmergencias } from "@/hooks/getEmergencias";
import { getNecessidades } from "@/hooks/getNecessidades";
import { getPost } from "@/hooks/getPost";
import api from "@/services/api";

/* ---- ErrorBoundary simples para capturar exceptions de render ---- */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (err: Error, info: any) => void },
  { hasError: boolean; error?: Error; info?: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined, info: undefined };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary captured an error:", error, info);
    this.setState({ error, info });
    if (this.props.onError) this.props.onError(error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, maxWidth: 900, width: "100%" }} className="">
          <h2 style={{ marginTop: 0, color: "#b91c1c" }}>
            Erro ao carregar o perfil
          </h2>
          <p style={{ color: "#374151" }}>
            Ocorreu um erro ao renderizar a tela de perfil. O erro foi
            registrado no console do navegador. Você pode continuar usando a
            aplicação — abra o console (F12) e cole o erro aqui para que eu
            corrija.
          </p>
          <details style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
            <summary style={{ cursor: "pointer" }}>
              Ver detalhes do erro (console também possui stack)
            </summary>
            <div style={{ marginTop: 8, color: "#6b7280" }}>
              {this.state.error
                ? `${this.state.error.name}: ${this.state.error.message}`
                : "Erro desconhecido"}
            </div>
            {this.state.info && (
              <pre
                style={{
                  background: "#fff",
                  padding: 12,
                  borderRadius: 8,
                  overflow: "auto",
                }}
              >
                {String(this.state.info.componentStack ?? "")}
              </pre>
            )}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ---- Profile fallback inline (debug-safe) ---- */
function ProfileFallback({ onEditRequest }: { onEditRequest?: () => void }) {
  return <div style={{ padding: 24, maxWidth: 900, width: "100%" }}></div>;
}

/* ---- Home component (principal) ---- */
export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("publicacoes");
  const [user, setUser] = useState();

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("usuario")));
  }, []);
  // DEBUG: detecta query string ?view=login ou ?view=forgot-password
  const [debugView, setDebugView] = useState<string | null>(null);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("view");
      if (v) setDebugView(v);

      if (!checkIsAuth()) setDebugView("login");
    } catch {
      setDebugView(null);
    }
  }, []);

  useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const custom = ev as CustomEvent;
        const orgDetail = custom.detail as ONG | undefined | null;
        if (!orgDetail) return;
        setSelectedOrg(orgDetail);
        setShowOrgModal(true);
      } catch (err) {
      }
    };

    window.addEventListener("view-org", handler as EventListener);

    // console.log("sortedCenters:", sortedCenters);

    return () =>
      window.removeEventListener("view-org", handler as EventListener);
  }, []);

  // --- ESTADOS básicos (mantidos) ---
  const [centers, setCenters] = useState<Centro[]>([]);
  const [showCreateCenter, setShowCreateCenter] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Centro | null>(null);
  const [showEditCenter, setShowEditCenter] = useState(false);

  const [emergencies, setEmergencies] = useState<Emergencia[]>([]);
  const [showCreateEmergency, setShowCreateEmergency] = useState(false);
  const [editingEmergency, setEditingEmergency] = useState<Emergencia | null>(
    null,
  );
  const [showEditEmergency, setShowEditEmergency] = useState(false);

  const [needs, setNeeds] = useState<Need[]>(MOCK_NEEDS ?? []);
  const [showCreateNeed, setShowCreateNeed] = useState(false);
  const [editingNeed, setEditingNeed] = useState<Need | null>(null);
  const [showEditNeed, setShowEditNeed] = useState(false);

  const [volunteers, setVolunteers] = useState<Volunteer[]>(MOCK_VOLUNTEERS);
  const [showCreateVolunteer, setShowCreateVolunteer] = useState(false);

  const [selectedOrg, setSelectedOrg] = useState<ONG | null>(null);
  const [showOrgModal, setShowOrgModal] = useState(false);

  const currentUserOrg = "o4";

  // handlers (mantidos)
  const handleCreateCenter = (c: Centro) => setCenters((s) => [c, ...s]);
  const handleUpdateCenter = (c: Centro) => {
    const cid = (c as any)?._id ?? (c as any)?.id;
    setCenters((s) =>
      s.map((x) => {
        const xid = (x as any)?._id ?? (x as any)?.id;
        return xid === cid ? { ...x, ...c } : x;
      }),
    );
    getCentros()
      .then(async (data) => {
        setCenters(data);
      })
      .catch((err) => console.warn("getCentros failed:", err));
  };

  const handleDeleteCenter = (id: string) => {
    if (confirm("Excluir centro?"))
      setCenters((s) => s.filter((x) => x._id !== id));
  };

  const handleCreateEmergency = (e: Emergencia) =>
    setEmergencies((s) => [{ ...e, authorName: currentUser }, ...s]);
  const handleUpdateEmergency = async (e: Emergencia) => {
    setEmergencies((s) => s.map((x) => (x._id === e._id ? e : x)))
  };
  const handleDeleteEmergency = (id: string) => {
    if (confirm("Excluir emergência?"))
      setEmergencies((s) => s.filter((x) => x._id !== id));
  };

  const handleCreateNeed = (n: Need) => {
    setNeeds((s) => [n, ...s])
    getNecessidades()
      .then(async (data) => {
        setNeeds(data);
      })
      .catch((err) => console.warn("getNecessidades failed:", err));
  };
  const handleUpdateNeed = (n: Need) =>
    setNeeds((s) => s.map((x) => (x.id === n.id ? n : x)));
  const handleDeleteNeed = (id: string) => {
    if (confirm("Excluir necessidade?"))
      setNeeds((s) => s.filter((x) => x.id !== id));
  };

  const [posts, setPosts] = useState<PostType[]>([]);

  const handleCreateVolunteer = (v: Volunteer) =>
    setVolunteers((s) => [v, ...s]);

  useEffect(() => {
    // carregar centros, emergências, necessidades e posts (uma única effect)
    getCentros()
      .then(async (data) => {
        setCenters(data);
      })
      .catch((err) => console.warn("getCentros failed:", err));

    getNecessidades()
      .then(async (data) => {
        setNeeds(data);
      })
      .catch((err) => console.warn("getNecessidades failed:", err));
    getEmergency();
    getPosts();
  }, []);
  function getEmergency(newPost?: any) {
    if (newPost) {
      setEmergencies((prev) => [newPost, ...(prev ?? [])]);
      return Promise.resolve();
    }
    getEmergencias()
      .then(async (data) => {
        setEmergencies(data);
      })
      .catch((err) => console.warn("getEmergencias failed:", err));
  }
  // dentro de Home (app/page.tsx)
  function getPosts(newPost?: any) {
    if (newPost) {
      setPosts((prev) => [newPost, ...(prev ?? [])]);
      return Promise.resolve();
    }

    return getPost()
      .then((data) => {
        setPosts(data ?? []);
      })
      .catch((err) => {
        console.warn("getPost failed:", err);
      });
  }

  const sortedEmergencies = useMemo(
    () =>
      [...emergencies].sort(
        (a, b) =>
          new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime(),
      ),
    [emergencies],
  );
  const sortedCenters = useMemo(
    () => centers?.filter((c) => c.orgId === user?.organizations?.[0]?._id),
    [centers],
  );

  const orgCenters = useMemo(() => {
    if (!selectedOrg) return [];
    return centers?.filter((c) => c.orgId === selectedOrg.id);
  }, [selectedOrg, centers]);

  const checkIsAuth = () => {
    return Cookies.get("app.token");
  };

  const [searchQuery, setSearchQuery] = useState("");

  function normalizeText(v: unknown) {
    const s = String(v ?? "");
    return s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();
  }

  const filteredCenters = useMemo(() => {
    const base = sortedCenters ?? []; // garante array
    if (!searchQuery) return base;

    const q = normalizeText(searchQuery);

    // DEBUG (opcional): ver 3 primeiros centros no console para ajustar campos
    // console.debug("sample centers:", base.slice(0,3));

    return base.filter((c) => {
      // acesse vários campos possíveis e normalize todos
      const nome = normalizeText((c as any).nome);
      const address = normalizeText(
        (c as any).address ?? (c as any).endereco ?? (c as any).location,
      );
      const description = normalizeText(
        (c as any).description ?? (c as any).desc ?? (c as any).about,
      );
      const phone = normalizeText((c as any).phone ?? (c as any).telefone);
      const email = normalizeText((c as any).email ?? (c as any).contactEmail);
      const extra = normalizeText(
        // concat de campos livres — captura textos longos onde "tttttt" pode estar
        [(c as any).content, (c as any).body, (c as any).notes].join(" "),
      );

      // verifica se q está contido em qualquer campo
      return (
        nome.includes(q) ||
        address.includes(q) ||
        description.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        extra.includes(q)
      );
    });
  }, [searchQuery, sortedCenters]);

  // useEffect(() => {
  //   try {
  //     console.debug("SEARCH DEBUG:", {
  //       searchQuery,
  //       centers: Array.isArray(filteredCenters) ? filteredCenters.length : "(not ready)",
  //       emergencies: Array.isArray(filteredEmergencies) ? filteredEmergencies.length : "(not ready)",
  //       needs: Array.isArray(filteredNeeds) ? filteredNeeds.length : "(not ready)",
  //       volunteers: Array.isArray(filteredVolunteers) ? filteredVolunteers.length : "(not ready)",
  //     });
  //   } catch (err) {
  //     console.warn("SEARCH DEBUG failed:", err);
  //   }
  // }, [searchQuery, filteredCenters, filteredEmergencies, filteredNeeds, filteredVolunteers]);

  const filteredPosts = useMemo(() => {
    const base = posts ?? [];
    if (!searchQuery) return base;

    const q = normalizeText(searchQuery);

    return base.filter((p: any) => {
      try {
        const title = normalizeText(p.titulo ?? p.title ?? p.nome ?? "");
        const desc = normalizeText(
          p.descricao ?? p.description ?? p.content ?? p.body ?? "",
        );
        const author = normalizeText(
          p.usuario?.nome ?? p.authorName ?? p.usuario?.nome ?? "",
        );
        const extra = normalizeText(
          [
            p.image ?? "",
            p.tags
              ? Array.isArray(p.tags)
                ? p.tags.join(" ")
                : String(p.tags)
              : "",
            p.usuario?.email ?? "",
            p.usuario?.telefone ?? "",
            p.usuario?._id
          ].join(" "),
        );
        const hay = [title, desc, author, extra, p.usuario?._id].join(" ");
        return hay.includes(q);
      } catch (err) {
        console.warn("filter post failed for item:", p, err);
        return false;
      }
    });
  }, [searchQuery, posts]);

  const filteredEmergencies = useMemo(() => {
    const base = sortedEmergencies ?? [];
    if (!searchQuery) return base;
    const q = normalizeText(searchQuery);

    // quick sample debug to inspect object shape (uncomment if needed)
    // console.debug("sample emergencies raw:", base.slice(0,3));

    return base.filter((e) => {
      try {
        // Extract the common fields we expect across different shapes
        const title = normalizeText(
          (e as any).title ?? (e as any).name ?? (e as any).titulo ?? "",
        );
        const desc = normalizeText(
          (e as any).description ??
            (e as any).desc ??
            (e as any).body ??
            (e as any).details ??
            "",
        );
        const location = normalizeText(
          (e as any).location ??
            (e as any).address ??
            (e as any).endereco ??
            "",
        );
        const org = normalizeText(
          (e as any).orgName ??
            (e as any).organization ??
            (e as any).authorName ??
            "",
        );
        const contact = normalizeText(
          (e as any).phone ?? (e as any).telefone ?? (e as any).contact ?? "",
        );
        const category = normalizeText(
          (e as any).category ?? (e as any).tipo ?? "",
        );
        // free-text fields that might contain long content
        const notes = normalizeText(
          (e as any).notes ??
            (e as any).observations ??
            (e as any).content ??
            (e as any).body ??
            "",
        );
        // also consider nested objects that commonly hold strings (safely)
        const nestedValues: string[] = [];

        Object.entries(e || {}).forEach(([k, v]) => {
          if (v == null) return;
          if (
            typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean"
          ) {
            // already handled above, but keep for any extra primitive
            nestedValues.push(String(v));
          } else if (Array.isArray(v)) {
            nestedValues.push(
              v.map((x) => (x == null ? "" : String(x))).join(" "),
            );
          } else if (typeof v === "object") {
            // pick primitive children only (avoid [object Object])
            Object.values(v).forEach((child) => {
              if (child == null) return;
              if (
                typeof child === "string" ||
                typeof child === "number" ||
                typeof child === "boolean"
              ) {
                nestedValues.push(String(child));
              }
            });
          }
        });

        const extra = normalizeText(nestedValues.join(" "));

        // final haystack
        const hay = [
          title,
          desc,
          location,
          org,
          contact,
          category,
          notes,
          extra,
        ].join(" ");

        return hay.includes(q);
      } catch (err) {
        console.warn("filter emergency failed for item:", e, err);
        return false;
      }
    });
  }, [searchQuery, sortedEmergencies]);

  const filteredNeeds = useMemo(() => {
    const base = needs ?? [];
    if (!searchQuery) return base;
    const q = normalizeText(searchQuery);

    // console.debug("sample needs raw:", base.slice(0,3));

    return base.filter((n) => {
      try {
        const title = normalizeText(
          (n as any).title ?? (n as any).name ?? (n as any).titulo ?? "",
        );
        const desc = normalizeText(
          (n as any).description ??
            (n as any).desc ??
            (n as any).body ??
            (n as any).details ??
            "",
        );
        const category = normalizeText(
          (n as any).category ?? (n as any).tipo ?? (n as any).tag ?? "",
        );
        const center = normalizeText(
          (n as any).centerName ??
            (n as any).center ??
            (n as any).orgName ??
            "",
        );
        const contact = normalizeText(
          (n as any).phone ?? (n as any).telefone ?? (n as any).contact ?? "",
        );
        const notes = normalizeText(
          (n as any).notes ??
            (n as any).observations ??
            (n as any).content ??
            "",
        );

        // safe nested extraction for extra text
        const nestedValues: string[] = [];
        Object.entries(n || {}).forEach(([k, v]) => {
          if (v == null) return;
          if (
            typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean"
          ) {
            nestedValues.push(String(v));
          } else if (Array.isArray(v)) {
            nestedValues.push(
              v.map((x) => (x == null ? "" : String(x))).join(" "),
            );
          } else if (typeof v === "object") {
            Object.values(v).forEach((child) => {
              if (child == null) return;
              if (
                typeof child === "string" ||
                typeof child === "number" ||
                typeof child === "boolean"
              ) {
                nestedValues.push(String(child));
              }
            });
          }
        });
        const extra = normalizeText(nestedValues.join(" "));

        const hay = [title, desc, category, center, contact, notes, extra].join(
          " ",
        );
        return hay.includes(q);
      } catch (err) {
        console.warn("filter need failed for item:", n, err);
        return false;
      }
    });
  }, [searchQuery, needs]);
  const filteredVolunteers = useMemo(() => {
    const base = volunteers ?? [];
    if (!searchQuery) return base;
    const q = searchQuery.toLowerCase();
    return base.filter((v) => {
      const name = String((v as any)?.name ?? "").toLowerCase();
      const email = String((v as any)?.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [searchQuery, volunteers]);
  function handleUpdatePostInParent(updated: PostType) {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  }
  const handleDeleteCenterFromList = async (id: string) => {
    await api.delete(`/api/v1/centros/${id}`);
    setCenters((s) => s.filter((x) => x._id !== id));
  };
  // --- DEBUG MODE: render login ou forgot-password only if requested via ?view=login ou ?view=forgot-password
  if (debugView === "login") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Suspense fallback={<div>Carregando tela de login...</div>}>
          <LoginPageLazy />
        </Suspense>
      </div>
    );
  }
  if (debugView === "forgot-password") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Suspense fallback={<div>Carregando tela de esqueci senha...</div>}>
          <ForgotPasswordPageLazy />
        </Suspense>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header
        active={activeTab}
        onChangeActive={setActiveTab}
        onSearch={setSearchQuery} // NOVO
      />

      <main className={styles.main}>
        {/* Se estivermos em perfil, não renderizamos o aside vazio nem o RightBar */}
        {!(activeTab === "perfil") && (
          <aside
            className={styles.right}
            aria-hidden
            style={{ visibility: "hidden" }}
          />
        )}

        <div className={styles.center}>
          {activeTab === "publicacoes" && (
            <Feed posts={filteredPosts} onCreate={getPosts} onUpdatePost={handleUpdatePostInParent} onRefresh={getPosts}/>
          )}

          {activeTab === "centros" && (
            <CentersList
              key={`centers:${searchQuery}`}
              centers={filteredCenters}
              onEdit={(c) => {
                setEditingCenter(c);
                setShowEditCenter(true);
              }}
              onDelete={(id) => {
                handleDeleteCenterFromList(id);
              }}
            />
          )}

          {activeTab === "emergencias" && (
            <EmergenciesList
              key={`emergencias:${searchQuery}`}
              emergencies={filteredEmergencies}
              currentUser={user?._id}
              onEdit={(em: Emergency) => {
                setEditingEmergency(em);
                setShowEditEmergency(true);
              }}
              onDelete={(id: string) => {
                const em = emergencies.find((x) => x.id === id);
                handleDeleteEmergency(id);
              }}
            />
          )}

          {activeTab === "necessidades" && (
            <NeedsList
              key={`needs:${searchQuery}`}
              needs={filteredNeeds}
              currentUser={user?._id}
              onEdit={(updated) =>
                setNeeds((prev) =>
                  prev.map((n) => (n._id === updated._id ? updated : n)),
                )
              }
              onDelete={(id) => {
                setNeeds((prev) => prev.filter((n) => n._id !== id))
                getNecessidades()
                  .then(async (data) => {
                    setNeeds(data);
                  })
                  .catch((err) => console.warn("getNecessidades failed:", err));
              }}
            />
          )}

          {activeTab === "voluntarios" && (
            <VolunteersList volunteers={filteredVolunteers} />
          )}

          {activeTab === "perfil" && (
            <ErrorBoundary
              onError={(err, info) => {
                console.log(
                  "Profile render error captured in Home:",
                  err,
                  info,
                );
              }}
            >
              <Suspense
                fallback={
                  <ProfileFallback
                    onEditRequest={() => setActiveTab("configuracoes")}
                  />
                }
              >
                <ProfilePageLazy />
              </Suspense>
            </ErrorBoundary>
          )}

          {activeTab === "configuracoes" && (
            <Suspense
              fallback={
                <div style={{ padding: 24 }}>Carregando configurações...</div>
              }
            >
              <SettingsPage />
            </Suspense>
          )}
        </div>

        {/* RightBar: renderizamos somente se NÃO estivermos na view de perfil ou configurações */}
        {activeTab !== "perfil" && activeTab !== "configuracoes" && (
          <aside className={styles.right}>
            <RightBar
              org={selectedOrg || undefined}
              showRegister={
                activeTab === "centros" ||
                activeTab === "emergencias" ||
                activeTab === "necessidades" ||
                activeTab === "voluntarios"
              }
              onRegisterClick={() => {
                if (activeTab === "centros") setShowCreateCenter(true);
                if (activeTab === "emergencias") setShowCreateEmergency(true);
                if (activeTab === "necessidades") setShowCreateNeed(true);
                if (activeTab === "voluntarios") setShowCreateVolunteer(true);
              }}
              registerLabel={
                activeTab === "emergencias"
                  ? "Informar emergência"
                  : activeTab === "necessidades"
                    ? "Criar necessidade"
                    : activeTab === "voluntarios"
                      ? "Cadastrar Voluntário"
                      : "Cadastrar centro"
              }
            />
          </aside>
        )}
      </main>

      {/* MODAIS */}
      <CreateCenterModal
        open={showCreateCenter}
        onClose={() => setShowCreateCenter(false)}
        onCreate={(c) => {
          handleCreateCenter(c);
          setShowCreateCenter(false);
        }}
      />
      <EditCenterModal
        open={showEditCenter}
        center={editingCenter}
        onClose={() => setShowEditCenter(false)}
        onUpdate={(c) => {
          handleUpdateCenter(c);
          setShowEditCenter(false);
        }}
      />

      <CreateEmergencyModal
        open={showCreateEmergency}
        onClose={() => setShowCreateEmergency(false)}
        onCreate={getEmergency}
      />

      <EditEmergencyModal
        open={showEditEmergency}
        emergency={editingEmergency}
        onClose={() => setShowEditEmergency(false)}
        onUpdate={(e) => {
          handleUpdateEmergency(e);
          setShowEditEmergency(false);
        }}
      />

      <CreateNeedModal
        open={showCreateNeed}
        onClose={() => setShowCreateNeed(false)}
        onCreate={(n) => {
          handleCreateNeed(n);
          setShowCreateNeed(false);
        }}
        centersFilterOrgId={user?.organizations[0]?._id}
        centers={centers}
        emergencies={emergencies}
      />

      <CreateVolunteerModal
        open={showCreateVolunteer}
        onClose={() => setShowCreateVolunteer(false)}
        onCreate={(v) => {
          handleCreateVolunteer(v);
          setShowCreateVolunteer(false);
        }}
      />

      <OrganizationModal
        open={showOrgModal}
        org={selectedOrg as ONG}
        centers={centers} // NÃO filtre aqui
        emergencies={emergencies}
        needs={needs}
        onClose={() => setShowOrgModal(false)}
      />
    </div>
  );
}
