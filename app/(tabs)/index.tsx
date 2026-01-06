import { View, Text, StyleSheet, FlatList, Button, TextInput } from "react-native";
import { useState } from "react";
import { useTheme } from "../../constants/ThemeContext";
import { useBooks } from "../../hooks/BooksContext";
import { BookCard } from "../../components/ui/BookCard";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { theme } = useTheme();
  const { books } = useBooks();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const recent = [...books].slice(-3).reverse();

  const query = searchQuery.trim().toLowerCase();
  const searchResults = query
    ? books.filter(
        (b) =>
          (b.title || "").toLowerCase().includes(query) ||
          (b.author || "").toLowerCase().includes(query)
      )
    : [];

  // Sugerencias dinámicas basadas en los datos de la biblioteca
  const total = books.length;
  const noImage = books.filter((b) => !b.image).length;

  // contar grupos duplicados por título+autor
  const keyCount: Record<string, number> = {};
  books.forEach((b) => {
    const key = `${b.title.trim().toLowerCase()}|${(b.author || "").trim().toLowerCase()}`;
    keyCount[key] = (keyCount[key] || 0) + 1;
  });
  const duplicateGroups = Object.values(keyCount).filter((c) => c > 1).length;

  const suggestions: { id: string; title: string; desc: string; action: () => void }[] = [];

  if (noImage > 0) {
    suggestions.push({
      id: "caratulas",
      title: `Añadir carátulas (${noImage})`,
      desc: "Mejora la apariencia de tu biblioteca añadiendo fotos a tus libros.",
      action: () => router.push("/biblioteca"),
    });
  }

  if (total <= 2) {
    suggestions.push({
      id: "mas",
      title: "Agregar más libros",
      desc: "Tu colección es pequeña. Añade nuevos títulos para empezar.",
      action: () => router.push("/agregar_libro"),
    });
  }

  if (duplicateGroups > 0) {
    suggestions.push({
      id: "duplicados",
      title: `Revisar duplicados (${duplicateGroups})`,
      desc: "Detecté títulos repetidos. Revisa y elimina o edita duplicados.",
      action: () => router.push("/biblioteca"),
    });
  }

  if (suggestions.length === 0 && total > 0) {
    suggestions.push({
      id: "organizar",
      title: "Organiza tu colección",
      desc: "Añade etiquetas o carátulas para tenerla más ordenada.",
      action: () => router.push("/biblioteca"),
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text, marginTop: 10 }]}>📚 BookBuddy</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>Tu compañero de lectura</Text>

      <View style={{ width: "100%", marginTop: 20 }}>
        {/* Campo de búsqueda */}
        <TextInput
          placeholder="Buscar por título o autor"
          placeholderTextColor={theme.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: theme.text,
            borderRadius: 8,
            color: theme.text,
            marginBottom: 12,
            backgroundColor: theme.card,
          }}
        />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recientes</Text>

        {query ? (
          // Mostrar resultados de búsqueda
          searchResults.length === 0 ? (
            <View style={{ paddingVertical: 20 }}>
              <Text style={{ color: theme.text }}>No se encontraron libros.</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <BookCard
                  title={item.title}
                  author={item.author}
                  image={item.image}
                  genre={item.genre}
                  onPress={() => router.push({ pathname: "/biblioteca", params: { open: item.id } })}
                />
              )}
            />
          )
        ) : recent.length === 0 ? (
          <View style={{ paddingVertical: 20 }}>
            <Text style={{ color: theme.text }}>Aún no tienes libros. ¡Agrega tu primero!</Text>
            <View style={{ marginTop: 10 }}>
              <Button title="Agregar libro" onPress={() => router.push("/agregar_libro")} />
            </View>
          </View>
        ) : (
          <FlatList
            data={recent}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <BookCard
                title={item.title}
                author={item.author}
                image={item.image}
                genre={item.genre}
                onPress={() => router.push({ pathname: "/biblioteca", params: { open: item.id } })}
              />
            )}
          />
        )}

        <View style={{ marginTop: 10 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sugerencias</Text>

          {suggestions.map((s) => (
            <View
              key={s.id}
              style={{
                marginTop: 8,
                padding: 12,
                borderRadius: 8,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.text,
              }}
            >
              <Text style={{ fontWeight: "600", color: theme.text }}>{s.title}</Text>
              <Text style={{ color: theme.text, marginTop: 6 }}>{s.desc}</Text>
              <View style={{ marginTop: 8 }}>
                <Button title="Ir" onPress={s.action} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center" },
  subtitle: { fontSize: 14, marginTop: 6, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "600" },
});
