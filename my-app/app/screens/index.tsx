// App.tsx
import React, { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import Header from "../componets/Header";
import CentersScreen from "./CentersScreen";
import DetailsScreen from "./DetailsScreen";
import MapScreen from "./MapScreen";
import PublicationsScreen from "./PublicationsScreen"; // <-- importar aqui

export default function App() {
  // incluir 'publications' no union
  const [activeTab, setActiveTab] = useState<
    "list" | "details" | "map" | "centers" | "publications"
  >("list");
  const [selectedEmergency, setSelectedEmergency] = useState<any>(null);

  function openDetails(item: any) {
    setSelectedEmergency(item);
    setActiveTab("details");
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/*<StatusBar barStyle="light-content" />*/}
      <Header onChangeTab={(tab) => setActiveTab(tab)} activeTab={activeTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#2f2f2f" },
  container: { flex: 1, backgroundColor: "#3b3b3b" },
});
