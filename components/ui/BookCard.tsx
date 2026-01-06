import { View, Text, Image, TouchableOpacity } from "react-native";
import { useTheme } from "../../constants/ThemeContext";

export function BookCard({
  title,
  author,
  image,
  genre,
  onPress,
}: {
  title: string;
  author: string;
  image?: string;
  genre?: string;
  onPress?: () => void;
}) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        style={{
          flexDirection: "row",
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.text,
          marginBottom: 12,
          alignItems: "center",
          backgroundColor: theme.card,
        }}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              marginRight: 12,
            }}
          />
        ) : (
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              marginRight: 12,
              backgroundColor: "#ccc",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#555", fontSize: 12 }}>Sin foto</Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: theme.text,
            }}
          >
            {title}
          </Text>
          <Text style={{ color: theme.text, marginTop: 3 }}>{author}</Text>
          {genre ? (
            <Text style={{ color: theme.text, marginTop: 4, fontStyle: "italic", fontSize: 12 }}>
              {genre}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
