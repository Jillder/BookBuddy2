import React from "react";
import { View, Text, FlatList, Button } from "react-native";
import { useTheme } from "../constants/ThemeContext";
import { useBooks } from "../hooks/BooksContext";
import { useRouter } from "expo-router";

export default function StatsScreen() {
  const { theme } = useTheme();
  const { books } = useBooks();
  const router = useRouter();

  const total = books.length;
  const byGenre: Record<string, number> = {};
  books.forEach((b) => {
    const g = b.genre ?? "Sin género";
    byGenre[g] = (byGenre[g] || 0) + 1;
  });

  const genreList = Object.entries(byGenre).map(([genre, count]) => ({ genre, count }));

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.text, marginTop: 10 }}>Estadísticas</Text>

      <View style={{ marginTop: 20 }}>
        <Text style={{ color: theme.text }}>Total de libros: {total}</Text>
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: "600", color: theme.text }}>Por género</Text>
        <FlatList
          data={genreList}
          keyExtractor={(item) => item.genre}
          renderItem={({ item }) => (
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
              <Text style={{ color: theme.text }}>{item.genre}</Text>
              <Text style={{ color: theme.text }}>{item.count}</Text>
            </View>
          )}
        />
      </View>
      <View style={{ marginBottom: 12 }}>
        <Button title="Regresar" onPress={() => router.back()} />
      </View>
    </View>
  );
}
