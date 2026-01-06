import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, Image, TouchableOpacity, Modal } from "react-native";
import { useTheme } from "../constants/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem("profile");
        if (raw) {
          const p = JSON.parse(raw);
          setName(p.name ?? "");
          setPhoto(p.photo ?? null);
        }
      } catch (e) {}
    };
    load();
  }, []);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    setPickerVisible(false);
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permiso requerido", "Debes permitir el acceso a la cámara.");
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    setPickerVisible(false);
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("Nombre requerido", "Introduce tu nombre de usuario.");
    try {
      await AsyncStorage.setItem("profile", JSON.stringify({ name: name.trim(), photo }));
      Alert.alert("Guardado", "Perfil actualizado.");
      router.back();
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar el perfil.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.text, marginTop: 10 }}>Editar perfil</Text>

      <Text style={{ marginTop: 20, marginBottom: 6, color: theme.text }}>Foto</Text>
      <TouchableOpacity onPress={() => setPickerVisible(true)} style={{ width: 120, height: 120, borderRadius: 60, overflow: "hidden", backgroundColor: theme.card, justifyContent: "center", alignItems: "center" }}>
        {photo ? <Image source={{ uri: photo }} style={{ width: 120, height: 120 }} /> : <Text style={{ color: theme.text }}>Seleccionar</Text>}
      </TouchableOpacity>

      <Modal visible={pickerVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: 260, backgroundColor: "#fff", padding: 16, borderRadius: 8 }}>
            <Button title="Tomar foto" onPress={pickFromCamera} />
            <View style={{ height: 8 }} />
            <Button title="Elegir de galería" onPress={pickFromGallery} />
            <View style={{ height: 8 }} />
            <Button title="Cancelar" color="red" onPress={() => setPickerVisible(false)} />
          </View>
        </View>
      </Modal>

      <Text style={{ marginTop: 20, marginBottom: 6, color: theme.text }}>Nombre de usuario</Text>
      <TextInput placeholder="Escribe tu nombre" placeholderTextColor={theme.text} value={name} onChangeText={setName} style={{ padding: 12, borderWidth: 1, borderColor: theme.text, borderRadius: 8, color: theme.text, backgroundColor: theme.card }} />

      <View style={{ marginTop: 24 }}>
        <Button title="Guardar" onPress={handleSave} />
      </View>
      <View style={{ marginBottom: 12, marginTop: 12 }}>
        <Button title="Regresar" onPress={() => router.back()} />
      </View>
    </View>
  );
}
