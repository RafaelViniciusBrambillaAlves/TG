// src/components/ScreenWrapper.tsx
import React from "react";
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  children: React.ReactNode;
  scrollable?: boolean;
  paddingHorizontal?: number;
};

export default function ScreenWrapper({ children, scrollable = true, paddingHorizontal = 16 }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal }]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, { paddingHorizontal }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingVertical: 20 },
});
