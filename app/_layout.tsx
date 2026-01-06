import { Stack } from "expo-router";
import { ThemeProvider } from "../constants/ThemeContext";
import { BooksProvider } from "../hooks/BooksContext";

export default function Layout() {
  return (
    <ThemeProvider>
      <BooksProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BooksProvider>
    </ThemeProvider>
  );
}
