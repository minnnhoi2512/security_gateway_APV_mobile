import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Provider } from "react-redux";
import { store } from "@/redux/store/store";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="check-in/scanQr"
            options={{ headerShown: true }}
          />
           <Stack.Screen
            name="createVisit/ScanQrCreate"
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="check-in/ListVisit"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="check-in/UserDetail"
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="createVisit/FormCreate"
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="check-out/CheckOutCard"
            options={{ headerShown: true }}
          />
          <Stack.Screen name="PickGate" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </Provider>
  );
}
