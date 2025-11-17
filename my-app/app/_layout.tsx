import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/auth.context";
import { DataProvider } from "@/context/DataContext";

export const unstable_settings = {
  anchor: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <ThemeProvider value={DefaultTheme}>
            <Stack
              screenOptions={{ headerShown: false }}
              options={{
                tabBarLabel: "Início",
              }}
            >
              <Stack.Screen
                name="screens"
                options={{
                  tabBarLabel: "Organizações", // <-- muda aqui
                }}
              />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
