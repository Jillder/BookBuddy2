import { View, Text, FlatList, Modal, TouchableOpacity, Image, Alert, Button } from "react-native";
import { useBooks, Book } from "../../hooks/BooksContext";
import { BookCard } from "../../components/ui/BookCard";
import { useTheme } from "../../constants/ThemeContext";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function LibraryScreen() {
  const { books, deleteBook } = useBooks();
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  // filtros y orden
  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  const [genrePickerVisible, setGenrePickerVisible] = useState(false);

  const [sortField, setSortField] = useState<"title" | "author">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const openModal = (book: Book) => {
    setSelectedBook(book);
    setModalVisible(true);
  };

  // Si se recibe ?open=<id> desde otra pantalla, abrir el modal correspondiente
  useEffect(() => {
    const openParam = (params as any).open;
    if (!openParam) return;

    const id = Number(openParam);
    if (Number.isNaN(id)) return;

    const bookToOpen = books.find((b) => b.id === id);
    if (bookToOpen) {
      openModal(bookToOpen);
      // Remover el query param para que no vuelva a abrirse al navegar
      router.replace("/biblioteca");
    }
  }, [params, books]);

  // Computar géneros únicos para el selector
  const genres = Array.from(new Set(books.map((b) => b.genre).filter(Boolean))) as string[];

  // Aplicar filtro y orden
  const displayedBooks = books
    .filter((b) => (filterGenre ? b.genre === filterGenre : true))
    .slice()
    .sort((a, b) => {
      const aVal = (a[sortField] || "").toString().toLowerCase();
      const bVal = (b[sortField] || "").toString().toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const closeModal = () => {
    setSelectedBook(null);
    setModalVisible(false);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Eliminar libro",
      `¿Estás seguro de que quieres eliminar "${selectedBook?.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            if (selectedBook) deleteBook(selectedBook.id);
            closeModal();
          },
        },
      ]
    );
  };

  const editBook = () => {
    closeModal();
    router.push({
      pathname: "/editar_libro",
      params: { book: JSON.stringify(selectedBook) }, // pasar como string
    });
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20, marginTop: 10, color: theme.text }}>
        Mis Libros
      </Text>

      {/* Controles: filtro por género y orden */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => setGenrePickerVisible(true)}
            style={{ padding: 8, borderRadius: 8, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.text }}
          >
            <Text style={{ color: theme.text }}>{filterGenre ?? "Filtrar por género"}</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}>
            <Text style={{ color: theme.text, marginRight: 8 }}>Ordenar por:</Text>
            <TouchableOpacity
              onPress={() => setSortField("title")}
              style={{ padding: 8, borderRadius: 8, backgroundColor: sortField === "title" ? theme.primary : theme.card, marginRight: 6 }}
            >
              <Text style={{ color: sortField === "title" ? "#fff" : theme.text }}>Título</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSortField("author")}
              style={{ padding: 8, borderRadius: 8, backgroundColor: sortField === "author" ? theme.primary : theme.card }}
            >
              <Text style={{ color: sortField === "author" ? "#fff" : theme.text }}>Autor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
              style={{ marginLeft: 10, padding: 8, borderRadius: 8, backgroundColor: theme.card }}
            >
              <Text style={{ color: theme.text }}>{sortOrder === "asc" ? "Asc" : "Desc"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={displayedBooks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BookCard
            title={item.title}
            author={item.author}
            image={item.image}
            genre={item.genre}
            onPress={() => openModal(item)}
          />
        )}
      />

      {/* Modal de selección de género */}
      <Modal visible={genrePickerVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{ width: "100%", maxWidth: 360, backgroundColor: "#fff", padding: 16, borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>Seleccionar género</Text>
            <TouchableOpacity
              onPress={() => {
                setFilterGenre(null);
                setGenrePickerVisible(false);
              }}
              style={{ paddingVertical: 10 }}
            >
              <Text>Mostrar todos</Text>
            </TouchableOpacity>
            {genres.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => {
                  setFilterGenre(g);
                  setGenrePickerVisible(false);
                }}
                style={{ paddingVertical: 10 }}
              >
                <Text>{g}</Text>
              </TouchableOpacity>
            ))}

            <View style={{ marginTop: 8 }}>
              <Button title="Cerrar" onPress={() => setGenrePickerVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              padding: 20,
              borderRadius: 10,
              backgroundColor: theme.card,
            }}
          >
            {selectedBook?.image && (
              <Image
                source={{ uri: selectedBook.image }}
                style={{ width: "100%", height: 160, borderRadius: 8, marginBottom: 10 }}
              />
            )}

            <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.text }}>
              {selectedBook?.title}
            </Text>

            <Text style={{ fontSize: 16, marginTop: 10, color: theme.text }}>
              Autor: {selectedBook?.author}
            </Text>

            {/* Botón Editar */}
            <TouchableOpacity
              onPress={editBook}
              style={{ marginTop: 20, padding: 12, backgroundColor: theme.primary, borderRadius: 8 }}
            >
              <Text style={{ textAlign: "center", color: "#fff" }}>Editar</Text>
            </TouchableOpacity>

            {/* Botón Eliminar */}
            <TouchableOpacity
              onPress={confirmDelete}
              style={{ marginTop: 12, padding: 12, backgroundColor: "#d9534f", borderRadius: 8 }}
            >
              <Text style={{ textAlign: "center", color: "#fff" }}>Eliminar</Text>
            </TouchableOpacity>

            {/* Cerrar */}
            <TouchableOpacity
              onPress={closeModal}
              style={{ marginTop: 12, padding: 10, backgroundColor: "#999", borderRadius: 8 }}
            >
              <Text style={{ textAlign: "center", color: "#fff" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
