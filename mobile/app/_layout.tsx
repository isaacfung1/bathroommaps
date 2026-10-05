import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false, title: "Bathroom Maps" }} />
      <StatusBar style="dark" />
    </>
  );
}
