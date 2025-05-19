import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RenderHTML from "react-native-render-html";

const web = "http://localhost:8080/api/recommend";
const mobil = "http://192.168.43.12:8080/api/recommend";

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [textInput, setTextInput] = useState("");
  const [apiResponse, setApiResponse] = useState<string>("");
  const [showResponse, setShowResponse] = useState(false);
  const [allergies, setAllergies] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);

        if (storedToken) {
          const storedUser = await AsyncStorage.getItem("user");
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setAllergies(user.allergies || "");
          }
        } else {
          setAllergies("");
        }
      } catch (e) {
        console.error("AsyncStorage okuma hatası:", e);
      }
    };
    loadSession();
  }, []);
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "İzin gerekli",
        "Fotoğraf seçebilmek için izin vermelisiniz."
      );
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!pickerResult.canceled) {
      const uri = pickerResult.assets?.[0]?.uri || null;
      const imageFile = pickerResult.assets?.[0]?.file || null;
      setSelectedFile(imageFile);
      setSelectedImage(uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("İzin gerekli", "Kamera kullanımı için izin vermelisiniz.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri || null;
      const imageFile = result.assets?.[0]?.file || null;
      setSelectedFile(imageFile);
      setSelectedImage(uri);
    }
  };

  const sendDataToApi = async () => {
    if (!selectedImage) {
      Alert.alert("Hata", "Lütfen önce bir fotoğraf seçin.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    const response = await fetch(selectedImage);
    const blob = await response.blob();

    if (selectedFile) {
      formData.append("image", selectedFile);
    } else {
      formData.append("image", {
        uri: selectedImage,
        name: "photo.jpg",
        type: blob.type || "image/jpeg",
      } as any);
    }
    formData.append("prompt", textInput);
    console.log(AsyncStorage.getItem("token"));

    try {
      const token = await AsyncStorage.getItem("token");
      const apiResponse = await fetch(mobil, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });
      const json = await apiResponse.json();
      setApiResponse(json.message);
      setShowResponse(true);
      if (apiResponse.ok) {
        setSelectedImage(null);
        setTextInput("");
      } else {
        Alert.alert("Hata", "API isteği başarısız oldu.");
      }
    } catch (error: any) {
      setApiResponse("Bir hata oluştu: " + error.message);
      setShowResponse(true);
      Alert.alert("Hata", "Bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setApiResponse("");
    setShowResponse(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Yükleniyor...</Text>
      </View>
    );
  }

  if (showResponse) {
    return (
      <View style={[styles.container, { justifyContent: "flex-start" }]}>
        <Text style={styles.responseTitle}>Öneri:</Text>;
        <ScrollView style={styles.responseContainer}>
          <Text>
            <RenderHTML source={{ html: apiResponse }} />
          </Text>
        </ScrollView>
        <TouchableOpacity style={styles.button} onPress={handleBack}>
          <Text style={styles.buttonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Fotoğraf Yükle</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.buttonHalf]}
          onPress={takePhoto}
        >
          <Text style={styles.buttonText}>Kamera ile Çek</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonHalf]}
          onPress={pickImage}
        >
          <Text style={styles.buttonText}>Galeriden Seç</Text>
        </TouchableOpacity>
      </View>

      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
      )}

      <Text style={styles.label}>Sahip olduğunuz alerjenler:</Text>
      <TextInput
        style={styles.input}
        value={allergies}
        multiline
        editable={!token} // token varsa dokunulmaz, yoksa düzenlenebilir
        placeholder={token ? "" : "Alerjen bilgisi yok"}
        placeholderTextColor="#888"
        onChangeText={setAllergies} // token yoksa güncelleme için
      />

      <TouchableOpacity style={styles.button} onPress={sendDataToApi}>
        <Text style={styles.buttonText}>Gönder</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  multiline: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  imagePreview: {
    width: 300,
    height: 300,
    marginVertical: 20,
    alignSelf: "center",
    borderRadius: 8,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 16,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    textAlignVertical: "top",
  },
  responseTitle: {
    fontWeight: "600",
    fontSize: 18,
    marginVertical: 12,
    color: "#333",
  },
  responseContainer: {
    maxHeight: "70%",
    marginBottom: 16,
  },
});
