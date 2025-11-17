// src/screens/EmergencyScreen.tsx
import { RootStackParamList } from "@/types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { View } from "react-native";
import EmergencyDetails from "../componets/EmergencyDetails";
import EmergencyHelp from "../componets/EmergencyHelp";
// import EmergencyLocation from "../components/EmergencyLocation"; // ativar se tiver

type Props = NativeStackScreenProps<RootStackParamList, "Emergency">;

export default function EmergencyScreen({ route }: Props) {
  const { id, tab = "details" } = route.params;


  return (
    <View style={{ flex: 1 }}>
      {tab === "details" && <EmergencyDetails id={id} />}
      {/* {tab === "location" && <EmergencyLocation id={id} />} */}
      {tab === "help" && <EmergencyHelp id={id} />}
    </View>
  );
}
