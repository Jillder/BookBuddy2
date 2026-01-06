import { View, Text, Button, Image, TouchableOpacity, Switch, Modal, Alert, Platform } from "react-native";
import { useTheme } from "../../constants/ThemeContext";
import { useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState<string>("Usuario");
  const [photo, setPhoto] = useState<string | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
  const [reminderTime, setReminderTime] = useState<string>("20:00");
  const [notifId, setNotifId] = useState<string | null>(null);
  const [timeModalVisible, setTimeModalVisible] = useState<boolean>(false);
  const [reminderDate, setReminderDate] = useState<Date>(() => {
    const [h, m] = "20:00".split(":");
    const d = new Date();
    d.setHours(parseInt(h, 10));
    d.setMinutes(parseInt(m, 10));
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  });

  const isFocused = useIsFocused();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const raw = await AsyncStorage.getItem("profile");
        if (raw) {
          const p = JSON.parse(raw);
          if (p.name) setName(p.name);
          if (p.photo) setPhoto(p.photo);
        }
        // load reminder settings
        const rRaw = await AsyncStorage.getItem("dailyReminder");
        if (rRaw) {
          const r = JSON.parse(rRaw);
          setReminderEnabled(!!r.enabled);
          if (r.time) setReminderTime(r.time);
          if (r.time) {
            const [hh, mm] = r.time.split(":");
            const d2 = new Date();
            d2.setHours(parseInt(hh || "0", 10));
            d2.setMinutes(parseInt(mm || "0", 10));
            d2.setSeconds(0);
            d2.setMilliseconds(0);
            setReminderDate(d2);
          }
          if (r.notifId) setNotifId(r.notifId);
        }
      } catch (e) {
        // ignore
      }
    };

    if (isFocused) loadProfile();
  }, [isFocused]);

  useEffect(() => {
    // If reminder state changes to enabled, schedule notification; if disabled, cancel it.
    const applyReminder = async () => {
      try {
        if (reminderEnabled) {
          // request permissions
          if (!Device.isDevice) {
            Alert.alert("Aviso", "Las notificaciones no funcionan en emuladores.");
            return;
          }

          const { status: existing } = await Notifications.getPermissionsAsync();
          let finalStatus = existing;
          if (existing !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          if (finalStatus !== "granted") {
            Alert.alert("Permiso denegado", "Permite el uso de notificaciones para activar recordatorios.");
            setReminderEnabled(false);
            return;
          }

          // parse time HH:MM
          const [hStr, mStr] = reminderTime.split(":");
          const hour = parseInt(hStr || "0", 10);
          const minute = parseInt(mStr || "0", 10);

          // cancel previous if exists
          if (notifId) {
            try {
              await Notifications.cancelScheduledNotificationAsync(notifId);
            } catch (e) {}
          }

          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: "Hora de leer",
              body: "Es un buen momento para leer un poco 📚",
            },
            trigger: {
              hour,
              minute,
              repeats: true,
            } as any,
          });
          setNotifId(id);
          await AsyncStorage.setItem("dailyReminder", JSON.stringify({ enabled: true, time: reminderTime, notifId: id }));
        } else {
          // disabled -> cancel
          if (notifId) {
            try {
              await Notifications.cancelScheduledNotificationAsync(notifId);
            } catch (e) {}
            setNotifId(null);
          }
          await AsyncStorage.setItem("dailyReminder", JSON.stringify({ enabled: false, time: reminderTime }));
        }
      } catch (e) {
        // ignore
      }
    };

    applyReminder();
  }, [reminderEnabled, reminderTime]);

  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 10, color: theme.text }}>
        Perfil
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, overflow: "hidden", backgroundColor: theme.card, justifyContent: "center", alignItems: "center" }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: 64, height: 64 }} />
          ) : (
            <Text style={{ color: theme.text, fontSize: 18 }}>{initials}</Text>
          )}
        </View>

        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: theme.text }}>{name}</Text>
        </View>

        <View>
          <Button title={theme.mode === "light" ? "Modo oscuro" : "Modo claro"} onPress={toggleTheme} color={theme.primary} />
        </View>
      </View>

      <View style={{ marginTop: 24 }}>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: theme.text, marginBottom: 6 }}>Recordatorio diario</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: theme.text }}>{reminderEnabled ? `Programado a ${reminderTime}` : "Desactivado"}</Text>
            <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
          </View>
          <View style={{ height: 8 }} />
          <TouchableOpacity
            onPress={() => {
              // sync picker to current reminderTime before opening
              const [hh, mm] = reminderTime.split(":");
              const d = new Date();
              d.setHours(parseInt(hh || "0", 10));
              d.setMinutes(parseInt(mm || "0", 10));
              d.setSeconds(0);
              d.setMilliseconds(0);
              setReminderDate(d);
              setTimeModalVisible(true);
            }}
            style={{ padding: 10, borderRadius: 8, backgroundColor: theme.card }}
          >
            <Text style={{ color: theme.text }}>Seleccionar hora ({reminderTime})</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={timeModalVisible} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
            <View style={{ width: 320, padding: 16, backgroundColor: theme.background, borderRadius: 8 }}>
                <Text style={{ color: theme.text, marginBottom: 8 }}>Selecciona la hora</Text>
                <DateTimePicker
                value={reminderDate}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event: any, date?: Date) => {
                  if (date) {
                    const hh: string = String(date.getHours()).padStart(2, "0");
                    const mm: string = String(date.getMinutes()).padStart(2, "0");
                    const newTime = `${hh}:${mm}`;
                    setReminderDate(date);
                    setReminderTime(newTime);
                    // persist the newly selected time immediately (use newTime)
                    if (Platform.OS === "android") {
                      setTimeModalVisible(false);
                      AsyncStorage.setItem("dailyReminder", JSON.stringify({ enabled: reminderEnabled, time: newTime, notifId }));
                      Alert.alert("Guardado", `Hora establecida a ${newTime}`);
                    }
                  } else {
                    // user dismissed picker on Android
                    if (Platform.OS === "android") setTimeModalVisible(false);
                  }
                }}
                />
              {Platform.OS === "ios" ? (
                <View style={{ marginTop: 12, flexDirection: "row", justifyContent: "space-between" }}>
                  <Button title="Cancelar" onPress={() => setTimeModalVisible(false)} />
                  <Button
                    title="Guardar"
                    onPress={() => {
                      // compute from reminderDate to avoid stale reminderTime
                      const hh = String(reminderDate.getHours()).padStart(2, "0");
                      const mm = String(reminderDate.getMinutes()).padStart(2, "0");
                      const newTime = `${hh}:${mm}`;
                      setReminderTime(newTime);
                      AsyncStorage.setItem("dailyReminder", JSON.stringify({ enabled: reminderEnabled, time: newTime, notifId }));
                      setTimeModalVisible(false);
                      Alert.alert("Guardado", `Hora establecida a ${newTime}`);
                    }}
                  />
                </View>
              ) : null}
            </View>
          </View>
        </Modal>
        <TouchableOpacity onPress={() => router.push("/editar_perfil")} style={{ padding: 12, borderRadius: 8, backgroundColor: theme.primary }}>
          <Text style={{ color: "#fff", textAlign: "center" }}>Editar perfil</Text>
        </TouchableOpacity>

        <View style={{ height: 10 }} />

        <TouchableOpacity onPress={() => router.push("/estadisticas")} style={{ padding: 12, borderRadius: 8, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.text }}>
          <Text style={{ color: theme.text, textAlign: "center" }}>Estadísticas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
