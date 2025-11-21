// app/components/Header.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Keyboard,
  Switch,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import EmergencyCard, { EmergencyType } from "./EmergencyCard";
import OrganizationCard from "./OrganizationCard";
import PublicationCard from "./PublicationCard";
import { ProfileDrawer } from "./ProfileDrawer";
import { useData } from "@/context/DataContext";

/* ---------- helpers ---------- */
const formatTimeLabel = (iso?: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "";
  }
};

const mapEmergenciasToCard = (list: any[]): EmergencyType[] =>
  (list ?? []).map((e, idx) => {
    const createdAtRaw = e.data_criacao ?? e.createdAt ?? e.created_at ?? null;
    return {
      id: e._id,
      titulo: e.titulo ?? "Emergência",
      subtitulo: e.status ?? "",
      severity:
        e.severity ??
        (e.status === "critico" || e.status === "danger"
          ? "danger"
          : e.status === "aviso"
            ? "warning"
            : "info"),
      timeLabel: formatTimeLabel(createdAtRaw),
      createdAtRaw,
      image: e.image,
      images: e.images ?? undefined,
      descricao: e.descricao ?? "",
      // NOVO: centros (array) e organizacao (opcional)
      centros: e.centros ?? e.centers ?? [],
      organizacao: e.organizacao ?? undefined,
    };
  });

const mapOrganizacoesToCard = (list: any[]) =>
  (list ?? []).map((org: any) => {
    const centers = org.centros ?? [];
    return {
      id_organizacao: org.id_organizacao ?? org._id ?? org.id ?? Math.random(),
      nome_organizacao: org.nome_organizacao ?? org.name ?? "Organização",
      descricao: org.descricao ?? "",
      thumbnail: org.thumbnail ?? org.logo ?? org.image,
      email: org.email ?? null,
      centros: centers.map((c: any) => ({
        id_centro: c.id_centro ?? c._id ?? Math.floor(Math.random() * 1000000),
        nome: c.nome,
        descricao: c.descricao ?? "",
        endereco: c.endereco ?? "",
        telefone: c.telefone ?? "",
        email: c.email ?? "",
        image: c.image ?? "",
        necessidades: c.necessidades,
        emergencias: org.emergencias,
      })),
      centersCount: Array.isArray(centers) ? centers.length : 0,
    };
  });

const mapPublicacoesToCard = (list: any[]) =>
  (list ?? []).map((p: any) => {
    const createdAtRaw = p.data_criacao ?? p.createdAt ?? p.created_at ?? null;
    return {
      titulo: p.titulo ?? "Publicação",
      descricao: p.descricao ?? "",
      timeLabel: formatTimeLabel(createdAtRaw),
      createdAtRaw,
      image: p.imagem ?? (Array.isArray(p.images) ? p.images[0] : undefined),
      images: p.images ?? undefined,
      author: p.author ?? p.usuario ?? undefined,
      local: p.local ?? p.location ?? undefined,
    };
  });

/* ---------- filtros: tipos de estado ---------- */
type EmergFilterState = {
  severity: { danger: boolean; warning: boolean; info: boolean };
  hasImage: boolean;
};
type OrgFilterState = {
  hasCenters: boolean;
  hasEmail: boolean;
};
type PubFilterState = {
  hasImage: boolean;
  authorQuery: string;
};

export default function Header() {
  const [infoVisible, setInfoVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "emergencias" | "organizacoes" | "publicacoes"
  >("organizacoes");

  const router = useRouter();
  const { emergencias, organizacoes, publicacoes, loading, reloadAll } =
    useData();

  // listas originais mapeadas
  const organizations = useMemo(
    () => mapOrganizacoesToCard(organizacoes),
    [organizacoes],
  );
  const emergencies = useMemo(() => {
    // organizations vem do mapOrganizacoesToCard — tem a propriedade 'id_organizacao' e 'centros'
    const orgMap = new Map<string, any>();
    (organizations ?? []).forEach((o: any) => {
      // normaliza a chave (pode ser _id ou id_organizacao)
      const key = String(o.id_organizacao ?? o._id ?? o.id ?? "");
      orgMap.set(key, o);
    });

    const merged = (emergencias ?? []).map((e: any) => {
      const orgKey = String(
        e.orgId ?? e.org_id ?? e.org?._id ?? e.orgIdReal ?? "",
      );
      const org = orgMap.get(orgKey) ?? null;
      // Anexa os centros encontrados (padronizo em 'centros')
      return {
        ...e,
        centros: org?.centros ?? [],
        organizacao: org ?? undefined,
      };
    });

    return mapEmergenciasToCard(merged);
  }, [emergencias, organizations]);
  const publications = useMemo(
    () => mapPublicacoesToCard(publicacoes),
    [publicacoes],
  );

  useEffect(() => {
    reloadAll().catch(() => {});
  }, []);

  /* ---------- busca com debounce ---------- */
  const [query, setQuery] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // @ts-ignore
    debounceRef.current = setTimeout(() => {
      setSearchTerm(query.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);
  const clearSearch = () => {
    setQuery("");
    setSearchTerm("");
    Keyboard.dismiss();
  };

  /* ---------- filtros: estado ---------- */
  const [emergFilters, setEmergFilters] = useState<EmergFilterState>({
    severity: { danger: true, warning: true, info: true },
    hasImage: false,
  });
  const [orgFilters, setOrgFilters] = useState<OrgFilterState>({
    hasCenters: false,
    hasEmail: false,
  });
  const [pubFilters, setPubFilters] = useState<PubFilterState>({
    hasImage: false,
    authorQuery: "",
  });

  // ordenação por aba
  const [emergOrder, setEmergOrder] = useState<"recent" | "severity">("recent");
  const [orgOrder, setOrgOrder] = useState<"alpha" | "centers">("alpha");
  const [pubOrder, setPubOrder] = useState<"recent" | "author">("recent");

  // contador de filtros ativos (badge)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (!Object.values(emergFilters.severity).every(Boolean)) count += 1;
    if (emergFilters.hasImage) count += 1;
    if (orgFilters.hasCenters) count += 1;
    if (orgFilters.hasEmail) count += 1;
    if (pubFilters.hasImage) count += 1;
    if (pubFilters.authorQuery && pubFilters.authorQuery.trim().length > 0)
      count += 1;
    return count;
  }, [emergFilters, orgFilters, pubFilters]);

  const resetFiltersForTab = (tab?: typeof activeTab) => {
    const t = tab ?? activeTab;
    if (t === "emergencias") {
      setEmergFilters({
        severity: { danger: true, warning: true, info: true },
        hasImage: false,
      });
      setEmergOrder("recent");
    } else if (t === "organizacoes") {
      setOrgFilters({ hasCenters: false, hasEmail: false });
      setOrgOrder("alpha");
    } else {
      setPubFilters({ hasImage: false, authorQuery: "" });
      setPubOrder("recent");
    }
  };

  const filteredEmergencies = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    // filtra
    const filtered = emergencies.filter((e) => {
      const sev = e.severity ?? "info";
      if (!emergFilters.severity[sev as keyof EmergFilterState["severity"]])
        return false;
      if (emergFilters.hasImage && !e.image && !(e.images && e.images.length))
        return false;
      if (!q) return true;
      return (
        [e.titulo, e.subtitulo, e.descricao, e.timeLabel].some((f) =>
          String(f ?? "")
            .toLowerCase()
            .includes(q),
        ) ||
        // procura pelos centros anexados (nome, endereço)
        (Array.isArray(e.centros) &&
          e.centros.some((c: any) => {
            const centerName = (c.nome_centro ?? c.name ?? "")
              .toString()
              .toLowerCase();
            const centerAddress = (c.endereco ?? c.address ?? "")
              .toString()
              .toLowerCase();
            return centerName.includes(q) || centerAddress.includes(q);
          }))
      );
    });
    // ordena (não mutamos original)
    const copy = [...filtered];
    if (emergOrder === "recent") {
      copy.sort((a, b) => {
        const da = a.createdAtRaw ? new Date(a.createdAtRaw).getTime() : 0;
        const db = b.createdAtRaw ? new Date(b.createdAtRaw).getTime() : 0;
        return db - da;
      });
    } else {
      // severity: danger > warning > info
      const rank = (s: string) =>
        s === "danger" ? 3 : s === "warning" ? 2 : 1;
      copy.sort(
        (a, b) => rank(b.severity ?? "info") - rank(a.severity ?? "info"),
      );
    }
    return copy;
  }, [emergencies, emergFilters, searchTerm, emergOrder]);
  const filteredOrganizations = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    const filtered = organizations.filter((org) => {
      if (
        orgFilters.hasCenters &&
        (!Array.isArray(org.centros) || org.centros.length === 0)
      )
        return false;
      if (orgFilters.hasEmail && !org.email) return false;
      if (!q) return true;
      const centerMatch =
        Array.isArray(org.centros) &&
        org.centros.some((c: any) => {
          return c;
        });
      return org || centerMatch;
    });
    const copy = [...filtered];
    if (orgOrder === "alpha") {
      copy.sort((a, b) =>
        String(a.nome_organizacao ?? "").localeCompare(
          String(b.nome_organizacao ?? ""),
          undefined,
          { sensitivity: "base" },
        ),
      );
    } else {
      copy.sort((a, b) => (b.centersCount ?? 0) - (a.centersCount ?? 0));
    }
    return copy;
  }, [organizations, orgFilters, searchTerm, orgOrder]);

  const filteredPublications = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    const filtered = publications.filter((p) => {
      if (pubFilters.hasImage && !p.image && !(p.images && p.images.length))
        return false;
      if (pubFilters.authorQuery && pubFilters.authorQuery.trim()) {
        const a =
          (p.author && (p.author.name || p.author.nome || p.author.titulo)) ??
          "";
        if (
          !String(a)
            .toLowerCase()
            .includes(pubFilters.authorQuery.trim().toLowerCase())
        )
          return false;
      }
      if (!q) return true;
      const authorName =
        (p.author && (p.author.name || p.author.nome || p.author.titulo)) ?? "";
      return (
        (p.titulo && p.titulo.toLowerCase().includes(q)) ||
        (p.descricao && p.descricao.toLowerCase().includes(q)) ||
        (p.local && String(p.local).toLowerCase().includes(q)) ||
        (authorName && String(authorName).toLowerCase().includes(q))
      );
    });
    const copy = [...filtered];
    if (pubOrder === "recent") {
      copy.sort((a, b) => {
        const da = a.createdAtRaw ? new Date(a.createdAtRaw).getTime() : 0;
        const db = b.createdAtRaw ? new Date(b.createdAtRaw).getTime() : 0;
        return db - da;
      });
    } else {
      copy.sort((a, b) => {
        const aa = (
          (a.author && (a.author.name || a.author.nome || "")) ||
          ""
        ).toLowerCase();
        const bb = (
          (b.author && (b.author.name || b.author.nome || "")) ||
          ""
        ).toLowerCase();
        return aa.localeCompare(bb, undefined, { sensitivity: "base" });
      });
    }
    return copy;
  }, [publications, pubFilters, searchTerm, pubOrder]);

  const tabs = [
    { key: "emergencias", label: "Emergências" },
    { key: "organizacoes", label: "Organizações" },
    { key: "publicacoes", label: "Publicações" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f6fa" }}>
      <View style={styles.container}>
        <View style={styles.logoLine}>
          <Image
            source={require("../../assets/images/logo5.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.secondLine}>
          <TouchableOpacity
            style={styles.userPhoto}
            onPress={() => setDrawerVisible(true)}
          >
            <AntDesign name="user" size={24} color="#555" />
          </TouchableOpacity>

          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Feather
              name="search"
              size={18}
              color="#999"
              style={{ marginLeft: 10, marginRight: 8 }}
            />
            <TextInput
              placeholder={
                activeTab === "emergencias"
                  ? "Pesquisar emergências (título, descrição, horário)..."
                  : activeTab === "organizacoes"
                    ? "Pesquisar organizações ou centros..."
                    : "Pesquisar publicações, autor ou local..."
              }
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={() => {
                setSearchTerm(query.trim());
                Keyboard.dismiss();
              }}
            />
            {query ? (
              <TouchableOpacity onPress={clearSearch} style={{ padding: 8 }}>
                <AntDesign name="close" size={16} color="#666" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={() => setFiltersVisible(true)}
              style={{
                marginLeft: 8,
                marginRight: 6,
                padding: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
              accessibilityLabel="Abrir filtros"
            >
              <Feather name="sliders" size={18} color="#007aff" />
              {activeFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {activeFiltersCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* INFO button: abre modal -- corrigido para não conflitar com outros modais */}
            <TouchableOpacity
              onPress={() => setInfoVisible(true)}
              style={styles.iconButton}
            >
              <Feather name="info" size={24} color="#007aff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/components/NotificationScreen")}
              style={styles.iconButton}
            >
              <AntDesign name="bell" size={24} color="#007aff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info modal — backdrop fecha ao tocar fora; conteúdo consome toque */}
        <Modal
          transparent
          visible={infoVisible}
          animationType="fade"
          onRequestClose={() => setInfoVisible(false)}
        >
          <Pressable
            style={styles.modalBackground}
            onPress={() => setInfoVisible(false)}
          >
            <View
              style={styles.modalBox}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Informações Importantes</Text>
                <Pressable
                  style={styles.closeButton}
                  onPress={() => setInfoVisible(false)}
                >
                  <AntDesign name="close" size={20} color="#333" />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={styles.modalIntro}>
                  Em situações de emergência, é fundamental saber a quem
                  recorrer.
                </Text>
                <View style={styles.list}>
                  <Text style={styles.modalText}>SAMU – 192</Text>
                  <Text style={styles.modalText}>Bombeiros – 193</Text>
                  <Text style={styles.modalText}>Polícia Militar – 190</Text>
                  <Text style={styles.modalText}>Polícia Civil – 197</Text>
                  <Text style={styles.modalText}>Defesa Civil – 199</Text>
                </View>
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        <View style={styles.tabsLine}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => {
                setActiveTab(tab.key as any);
                setSearchTerm((s) => s);
              }}
              style={styles.tabButton}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.key && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ProfileDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      {/* Filters modal — backdrop fecha ao tocar fora; .filtersBox consome toque */}
      <Modal
        visible={filtersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setFiltersVisible(false)}
        >
          <View
            style={styles.filtersBox}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.filtersTitle}>
              Filtros •{" "}
              {activeTab === "emergencias"
                ? "Emergências"
                : activeTab === "organizacoes"
                  ? "Organizações"
                  : "Publicações"}
            </Text>

            <ScrollView
              style={{ maxHeight: 360 }}
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              <Text style={[styles.filterLabel, { marginTop: 4 }]}>
                Ordenar por
              </Text>
              <View style={{ flexDirection: "row", marginBottom: 8 }}>
                {activeTab === "emergencias" && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        emergOrder === "recent" ? styles.chipActive : undefined,
                      ]}
                      onPress={() => setEmergOrder("recent")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          emergOrder === "recent" && styles.chipTextActive,
                        ]}
                      >
                        Mais recentes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        emergOrder === "severity"
                          ? styles.chipActive
                          : undefined,
                      ]}
                      onPress={() => setEmergOrder("severity")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          emergOrder === "severity" && styles.chipTextActive,
                        ]}
                      >
                        Por severidade
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {activeTab === "organizacoes" && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        orgOrder === "alpha" ? styles.chipActive : undefined,
                      ]}
                      onPress={() => setOrgOrder("alpha")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          orgOrder === "alpha" && styles.chipTextActive,
                        ]}
                      >
                        A-Z
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        orgOrder === "centers" ? styles.chipActive : undefined,
                      ]}
                      onPress={() => setOrgOrder("centers")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          orgOrder === "centers" && styles.chipTextActive,
                        ]}
                      >
                        Mais centros
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {activeTab === "publicacoes" && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        pubOrder === "recent" ? styles.chipActive : undefined,
                      ]}
                      onPress={() => setPubOrder("recent")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          pubOrder === "recent" && styles.chipTextActive,
                        ]}
                      >
                        Mais recentes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        pubOrder === "author" ? styles.chipActive : undefined,
                      ]}
                      onPress={() => setPubOrder("author")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          pubOrder === "author" && styles.chipTextActive,
                        ]}
                      >
                        Autor
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* specific filters */}
              {activeTab === "emergencias" && (
                <>
                  <Text style={styles.filterLabel}>Severity</Text>
                  <View style={{ flexDirection: "row", marginBottom: 8 }}>
                    {[
                      { key: "danger", label: "Crítico" },
                      { key: "warning", label: "Aviso" },
                      { key: "info", label: "Info" },
                    ].map((s) => (
                      <TouchableOpacity
                        key={s.key}
                        activeOpacity={0.85}
                        onPress={() =>
                          setEmergFilters((prev) => ({
                            ...prev,
                            severity: {
                              ...prev.severity,
                              // @ts-ignore
                              [s.key]: !prev.severity[s.key],
                            },
                          }))
                        }
                        style={[
                          styles.chip,
                          (emergFilters.severity as any)[s.key]
                            ? styles.chipActive
                            : undefined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            (emergFilters.severity as any)[s.key] &&
                              styles.chipTextActive,
                          ]}
                        >
                          {s.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.rowBetween}>
                    <Text style={styles.filterLabel}>Apenas com imagem</Text>
                    <Switch
                      value={emergFilters.hasImage}
                      onValueChange={(v) =>
                        setEmergFilters((p) => ({ ...p, hasImage: v }))
                      }
                    />
                  </View>
                </>
              )}

              {activeTab === "organizacoes" && (
                <>
                  <Text style={styles.filterLabel}>Organizações</Text>
                  <View style={{ height: 8 }} />
                  <View style={styles.rowBetween}>
                    <Text style={styles.filterLabel}>Possui centros</Text>
                    <Switch
                      value={orgFilters.hasCenters}
                      onValueChange={(v) =>
                        setOrgFilters((p) => ({ ...p, hasCenters: v }))
                      }
                    />
                  </View>
                  <View style={{ height: 12 }} />
                  <View style={styles.rowBetween}>
                    <Text style={styles.filterLabel}>
                      Tem e-mail cadastrado
                    </Text>
                    <Switch
                      value={orgFilters.hasEmail}
                      onValueChange={(v) =>
                        setOrgFilters((p) => ({ ...p, hasEmail: v }))
                      }
                    />
                  </View>
                </>
              )}

              {activeTab === "publicacoes" && (
                <>
                  <Text style={styles.filterLabel}>Publicações</Text>
                  <View style={{ height: 8 }} />
                  <View style={styles.rowBetween}>
                    <Text style={styles.filterLabel}>Apenas com imagem</Text>
                    <Switch
                      value={pubFilters.hasImage}
                      onValueChange={(v) =>
                        setPubFilters((p) => ({ ...p, hasImage: v }))
                      }
                    />
                  </View>

                  <View style={{ height: 12 }} />
                  <Text style={styles.filterLabel}>Autor (nome)</Text>
                  <TextInput
                    placeholder="Filtrar por autor (ex.: Maria)"
                    placeholderTextColor="#999"
                    style={styles.filterInput}
                    value={pubFilters.authorQuery}
                    onChangeText={(t) =>
                      setPubFilters((p) => ({ ...p, authorQuery: t }))
                    }
                    returnKeyType="done"
                  />
                </>
              )}
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 8,
                marginTop: 12,
              }}
            >
              <TouchableOpacity
                style={[styles.btn, styles.btnOutline]}
                onPress={() => {
                  resetFiltersForTab();
                }}
              >
                <Text style={styles.btnOutlineText}>Resetar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={() => {
                  setFiltersVisible(false);
                  setSearchTerm((s) => s);
                }}
              >
                <Text style={styles.btnPrimaryText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Content */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, marginTop: 8 }}>
        {loading && (
          <View style={{ padding: 24, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#007aff" />
            <Text style={{ marginTop: 8, color: "#666" }}>
              Carregando dados...
            </Text>
          </View>
        )}

        {!loading &&
          activeTab === "emergencias" &&
          filteredEmergencies.length === 0 && (
            <Text
              style={{ textAlign: "center", color: "#777", marginVertical: 12 }}
            >
              {searchTerm
                ? "Nenhuma emergência encontrada para essa busca."
                : "Nenhuma emergência encontrada."}
            </Text>
          )}

        {!loading &&
          activeTab === "organizacoes" &&
          filteredOrganizations.length === 0 && (
            <Text
              style={{ textAlign: "center", color: "#777", marginVertical: 12 }}
            >
              {searchTerm
                ? "Nenhuma organização ou centro corresponde à sua busca."
                : "Nenhuma organização encontrada."}
            </Text>
          )}

        {!loading &&
          activeTab === "publicacoes" &&
          filteredPublications.length === 0 && (
            <Text
              style={{ textAlign: "center", color: "#777", marginVertical: 12 }}
            >
              {searchTerm
                ? "Nenhuma publicação corresponde à sua busca."
                : "Nenhuma publicação encontrada."}
            </Text>
          )}

        {!loading &&
          activeTab === "emergencias" &&
          filteredEmergencies.map((item) => (
            <EmergencyCard key={String(item.id)} item={item} />
          ))}

        {!loading &&
          activeTab === "organizacoes" &&
          filteredOrganizations.map((org) => (
            <OrganizationCard
              key={String(org.id_organizacao)}
              organization={org}
            />
          ))}

        {!loading &&
          activeTab === "publicacoes" &&
          filteredPublications.map((pub, idx) => (
            <PublicationCard key={idx} publication={pub} />
          ))}
      </ScrollView>
    </View>
  );
}

/* ---------- estilos (mantive como antes) ---------- */
const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#f4f6fa",
  },
  logoLine: { alignItems: "center", marginBottom: 8 },
  secondLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 8,
    color: "#222",
    fontSize: 14,
  },
  iconButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  tabsLine: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tabText: { color: "#888", fontWeight: "600" },
  tabTextActive: { color: "#007aff", fontWeight: "700" },
  tabUnderline: {
    height: 2,
    width: "60%",
    backgroundColor: "#007aff",
    marginTop: 4,
    borderRadius: 2,
  },

  logoImage: {
    width: 100,
    height: 60,
    borderRadius: 8,
    backgroundColor: "transparent",
    marginBottom: -10,
    marginTop: -10,
  },

  // filters modal
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  filtersBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  filtersTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
  filterLabel: {
    fontSize: 13,
    color: "#222",
    marginBottom: 6,
    fontWeight: "700",
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: "#E8F0FF", borderColor: "#A7C4FF" },
  chipText: { color: "#333" },
  chipTextActive: { color: "#0b5fff", fontWeight: "700" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  filterInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    color: "#222",
  },

  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  btnPrimary: { backgroundColor: "#007aff" },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  btnOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  btnOutlineText: { color: "#333", fontWeight: "700" },

  filterBadge: {
    position: "absolute",
    right: -4,
    top: -6,
    backgroundColor: "#007aff",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  filterBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  // info modal
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  closeButton: { padding: 6, borderRadius: 6 },
  modalTitle: { fontWeight: "700", fontSize: 16, color: "#222" },
  modalContent: { paddingBottom: 8 },
  modalIntro: { fontSize: 14, color: "#555", marginBottom: 8 },
  list: { marginTop: 6 },
  modalText: { fontSize: 14, color: "#555", marginBottom: 6 },

  // search helpers
  searchRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 18,
    height: 36,
    paddingRight: 6,
    overflow: "hidden",
  },
  clearBtn: { paddingHorizontal: 8 },
});
