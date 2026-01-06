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
import { useTheme } from "../../constants/ThemeContext";
import { useState } from "react";
import { useBooks } from "../../hooks/BooksContext";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

export default function AddBookScreen() {
  const { addBook } = useBooks();
  const { theme } = useTheme();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [genre, setGenre] = useState<string | null>(null);
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

  // Elegir imagen de galería
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

  // Tomar foto con cámara
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

    addBook(title.trim(), author.trim(), image || undefined, genre || undefined);

    setTitle("");
    setAuthor("");
    setImage(null);

    Alert.alert("Éxito", "Libro agregado correctamente");
    router.push("/biblioteca");
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
        Registrar Libro
      </Text>

      {/* Selección de imagen */}

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

      {/* Modal con opciones */}
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

      {/* Título */}
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

      {/* Autor */}
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
        <Button title="Guardar" onPress={handleSave} />
      </View>
    </View>
  );
}
