import React, { useState } from "react";
import {
  Button,
  Image,
  Platform,
  StyleSheet,
  TextInput,
  View,
  Alert,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import RenderHTML from "react-native-render-html";

const web = "http://localhost:8080/api/recommend";
const mobil = "http://172.16.1.209:8080/api/recommend";

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [textInput, setTextInput] = useState("");
  const [apiResponse, setApiResponse] = useState<string>(""); // API cevabı için state
  const [showResponse, setShowResponse] = useState(false); // Response ekranı mı gösterilecek?

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "İzin gerekli",
        "Fotoğraf seçebilmek için izin vermelisiniz."
      );
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", // küçük harf
      quality: 1,
    });
    console.log(pickerResult);

    if (!pickerResult.canceled) {
      const uri = pickerResult.assets?.[0]?.uri || null;
      const imageFile = pickerResult.assets?.[0]?.file || null;
      setSelectedFile(imageFile);
      setSelectedImage(uri);
    }
  };

  const sendDataToApi = async () => {
    if (!selectedImage) {
      Alert.alert("Hata", "Lütfen önce bir fotoğraf seçin.");
      return;
    }
    setLoading(true); // istek başlamadan önce loading true

    const formData = new FormData();

    // Mobilde file yerine URI'den Blob oluştur
    // Expo'da bunu yapmak için fetch + blob yöntemi kullanılır
    const response = await fetch(selectedImage);
    const blob = await response.blob();

    if (selectedFile) {
      formData.append("image", selectedFile);
    } else {
      formData.append("image", {
        uri: selectedImage,
        name: "photo.jpg", // Dosya ismi mobilde verilmeli
        type: blob.type || "image/jpeg",
      } as any);
    }
    // React Native FormData için bu yapı gerekli

    formData.append("prompt", textInput);

    try {
      const apiResponse = await fetch(web, {
        method: "POST",
        body: formData,
      });

      const json = await apiResponse.json();

      setApiResponse(json.message);
      setShowResponse(true);

      if (apiResponse.ok) {
        Alert.alert("Başarılı", "Veriler başarıyla gönderildi!");
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
      setLoading(false); // istek bittiğinde loading false
    }
  };

  // Geri dön butonu fonksiyonu
  const handleBack = () => {
    setApiResponse("");
    setShowResponse(false);
  };
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Yükleniyor...</Text>
      </View>
    );
  }
  if (showResponse) {
    // Sadece response ekranı
    return (
      <View style={[styles.container, { justifyContent: "flex-start" }]}>
        <Text style={styles.responseTitle}>API Response:</Text>
        <ScrollView style={{ maxHeight: "80%", marginVertical: 10 }}>
          <RenderHTML source={{ html: apiResponse }}></RenderHTML>
        </ScrollView>
        <Button title="Geri Dön" onPress={handleBack} />
      </View>
    );
  }

  // Normal ekran (inputlar vs.)
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Fotoğraf Seç" onPress={pickImage} />

      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
      )}

      <Text style={styles.label}>Sahip olduğunuz alerjen maddeleri yazın:</Text>
      <TextInput
        style={styles.input}
        placeholder="Buraya yazınızı yazın"
        value={textInput}
        onChangeText={setTextInput}
      />

      <Button title="Gönder" onPress={sendDataToApi} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  imagePreview: {
    width: 300,
    height: 300,
    marginVertical: 20,
    alignSelf: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  responseTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  responseText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
  label: {
  fontWeight: "bold",
  marginBottom: 2,
  fontSize: 16,
  color: "#333",
  paddingTop: 15
},
});
