// src/screens/NotificationScreen.tsx
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StatusBar,
} from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useRouter } from "expo-router";

type NotificationItem = {
  id: string | number;
  title: string;
  message?: string;
  timeLabel?: string;
  severity?: "info" | "warning" | "danger";
  read?: boolean;
};

const MOCK: NotificationItem[] = [
  { id: 1, title: "Ginásio Restinga — novas vagas", message: "Vagas abertas no turno da tarde.", timeLabel: "2h", severity: "info", read: false },
  { id: 2, title: "Alerta: chuva intensa", message: "Risco de alagamentos em áreas baixas.", timeLabel: "4h", severity: "warning", read: false },
  { id: 3, title: "Doações recebidas", message: "Centro Navegantes recebeu 50 kits.", timeLabel: "1d", severity: "info", read: true },
  { id: 4, title: "Deslizamento — atenção", message: "Equipe de resgate ativada.", timeLabel: "2d", severity: "danger", read: false },
];

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK);
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const applyLayout = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const toggleRead = (id: string | number) => {
    applyLayout();
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  const markAsRead = (id: string | number) => {
    applyLayout();
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAll = () => {
    applyLayout();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const share = (item: NotificationItem) => {
  };

  const severityColor = (s?: NotificationItem["severity"]) =>
    s === "danger" ? colors.danger : s === "warning" ? colors.warning : colors.primary;

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const accent = severityColor(item.severity);
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => !item.read && markAsRead(item.id)}
        onLongPress={() => toggleRead(item.id)}
        style={styles.notification}
      >
        <View style={[styles.indicator, { backgroundColor: accent }]} />
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={[styles.title, item.read && styles.titleRead]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.time}>{item.timeLabel}</Text>
          </View>

          {item.message && (
            <Text style={[styles.message, item.read && styles.messageRead]} numberOfLines={2}>
              {item.message}
            </Text>
          )}

          <View style={styles.actions}>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: accent }]} />}
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => toggleRead(item.id)} style={styles.iconBtn}>
              <Feather name={item.read ? "circle" : "check-circle"} size={18} color={item.read ? "#CCC" : colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => share(item)} style={styles.iconBtn}>
              <Feather name="share-2" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AntDesign name="arrow-left" size={20} color={colors.border} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
          <Text style={styles.clearText}>Limpar todas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f4f6fa" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backBtn: { padding: 6 , color: ""},
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#222" },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  clearText: { color: "#007aff", fontWeight: "500", fontSize: 14 },

  notification: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 0,
    backgroundColor: "#f4f6fa",
    borderRadius: 12,
  },
  indicator: { width: 6, borderRadius: 3, marginRight: 12 },
  content: { flex: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 14, fontWeight: "500", color: "#222" },
  titleRead: { color: "#888" },
  time: { fontSize: 12, color: "#888" },

  message: { marginTop: 4, fontSize: 13, color: "#555" },
  messageRead: { color: "#aaa" },

  actions: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  iconBtn: { padding: 6 },
});
