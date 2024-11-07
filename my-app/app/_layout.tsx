import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Provider } from "react-redux";
import { store } from "@/redux/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);  
  const router = useRouter();



  useEffect(() => {
    const checkAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        setIsAuthenticated(!!token);
      } catch (error) {
        console.log("Error checking auth token:", error);
      }
    };
    checkAuthToken();
  }, []);


  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);



  useEffect(() => {
    if (isAuthenticated !== null && loaded) {
      if (isAuthenticated) {
        router.replace("/PickGate");  
      } else {
        router.replace("/login");   
      }
    }
  }, [isAuthenticated, loaded]);

  if (!loaded || isAuthenticated === null) {
    return null; 
  }



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
            options={{ headerShown: false }}
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
            name="createVisitor/CreateVisitor"
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="check-out/CheckOutCard"
            options={{ headerShown: true }}
          />
           <Stack.Screen
            name="profile/ProfileDetail"
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="check-in/CheckInOverall"
            options={{ headerShown: false }}
          />
           {/* <Stack.Screen
            name="check-in/ResponseCheckIn"
            options={{ headerShown: false }}
          /> */}
          <Stack.Screen name="PickGate" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </Provider>
  );
}
