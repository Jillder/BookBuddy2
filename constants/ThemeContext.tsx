import { createContext, useContext, useState, ReactNode } from "react";
import { useColorScheme } from "react-native";

const LightTheme = {
  mode: "light",
  background: "#F7EFE5",
  text: "#000",
  card: "#fff",
  primary: "#6F4E37",
};

const DarkTheme = {
  mode: "dark",
  background: "#1E1E1E",
  text: "#fff",
  card: "#2A2A2A",
  primary: "#A67B5B",
};

type ThemeType = typeof LightTheme;

type ThemeContextType = {
  theme: ThemeType;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const systemTheme = systemColorScheme === "dark" ? DarkTheme : LightTheme;

  const [theme, setTheme] = useState(systemTheme);

  const toggleTheme = () => {
    setTheme((prev) => (prev.mode === "light" ? DarkTheme : LightTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}
