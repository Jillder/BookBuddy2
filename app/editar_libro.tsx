import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useTheme } from "../constants/ThemeContext";
import { useBooks } from "../hooks/BooksContext";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function EditBookScreen() {
  const { updateBook } = useBooks();
  const { theme } = useTheme();
  const router = useRouter();

  const params = useLocalSearchParams();
  const bookParam = (params as any).book as string | undefined;

  const parsedBook = bookParam ? JSON.parse(bookParam) : null;

  const [title, setTitle] = useState<string>(parsedBook?.title ?? "");
  const [author, setAuthor] = useState<string>(parsedBook?.author ?? "");
  const [image, setImage] = useState<string | null>(parsedBook?.image ?? null);
  const [genre, setGenre] = useState<string | null>(parsedBook?.genre ?? null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [genrePickerVisible, setGenrePickerVisible] = useState(false);

  const GENRES = [
    "Ficción",
    "No ficción",
    "Fantasía",
    "Ciencia ficción",
    "Romance",
    "Misterio",
    "Biografía",
    "Otro",
  ];

  useEffect(() => {
    if (parsedBook) {
      setTitle(parsedBook.title ?? "");
      setAuthor(parsedBook.author ?? "");
      setImage(parsedBook.image ?? null);
      setGenre(parsedBook.genre ?? null);
    }
  }, [bookParam]);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 4],
      quality: 1,
    });

    setPickerVisible(false);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      return Alert.alert(
        "Permiso requerido",
        "Debes permitir el acceso a la cámara."
      );
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    setPickerVisible(false);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !author.trim()) {
      return Alert.alert("Campos incompletos", "Debes llenar título y autor.");
    }

    if (!parsedBook) {
      return Alert.alert("Error", "No se encontró el libro a editar.");
    }

    updateBook(parsedBook.id, {
      title: title.trim(),
      author: author.trim(),
      image: image || undefined,
      genre: genre || undefined,
    });

    Alert.alert("Éxito", "Libro actualizado correctamente");
    router.push({ pathname: "/biblioteca" });
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginTop: 10,
          color: theme.text,
        }}
      >
        Editar Libro
      </Text>

      <Text
        style={{
          marginTop: 20,
          marginBottom: 5,
          fontSize: 16,
          color: theme.text,
        }}
      >
        Foto del libro
      </Text>

      <TouchableOpacity
        onPress={() => setPickerVisible(true)}
        style={{
          height: 150,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.text,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          backgroundColor: "#2222",
        }}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ color: theme.text }}>Tomar o seleccionar imagen</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 250,
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Seleccionar imagen
            </Text>

            <Button title="Tomar foto" onPress={pickFromCamera} />
            <View style={{ height: 10 }} />
            <Button title="Elegir de galería" onPress={pickFromGallery} />
            <View style={{ height: 10 }} />
            <Button
              title="Cancelar"
              color="red"
              onPress={() => setPickerVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Selector de género */}
      <Text
        style={{
          marginTop: 20,
          marginBottom: 5,
          fontSize: 16,
          color: theme.text,
        }}
      >
        Género
      </Text>

      <TouchableOpacity
        onPress={() => setGenrePickerVisible(true)}
        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: theme.text,
          borderRadius: 8,
          backgroundColor: theme.card,
        }}
      >
        <Text style={{ color: genre ? theme.text : "#888" }}>{genre ?? "Seleccionar género"}</Text>
      </TouchableOpacity>

      <Modal
        visible={genrePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGenrePickerVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{ width: 300, backgroundColor: "#fff", padding: 16, borderRadius: 10 }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Seleccionar género</Text>
            {GENRES.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => {
                  setGenre(g);
                  setGenrePickerVisible(false);
                }}
                style={{ paddingVertical: 10 }}
              >
                <Text style={{ fontSize: 16 }}>{g}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ height: 8 }} />
            <Button title="Cancelar" color="red" onPress={() => setGenrePickerVisible(false)} />
          </View>
        </View>
      </Modal>

      <Text
        style={{
          marginTop: 20,
          marginBottom: 5,
          fontSize: 16,
          color: theme.text,
        }}
      >
        Título
      </Text>

      <TextInput
        placeholder="Escribe el título"
        placeholderTextColor={theme.text}
        value={title}
        onChangeText={setTitle}
        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: theme.text,
          color: theme.text,
          borderRadius: 8,
        }}
      />

      <Text
        style={{
          marginTop: 20,
          marginBottom: 5,
          fontSize: 16,
          color: theme.text,
        }}
      >
        Autor
      </Text>

      <TextInput
        placeholder="Escribe el autor"
        placeholderTextColor={theme.text}
        value={author}
        onChangeText={setAuthor}
        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: theme.text,
          color: theme.text,
          borderRadius: 8,
        }}
      />

      <View style={{ marginTop: 30 }}>
        <Button title="Guardar cambios" onPress={handleSave} />
      </View>
    </View>
  );
}
