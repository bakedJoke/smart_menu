import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

const web = "http://localhost:8080/api/auth/register";
const mobil = "http://192.168.43.12:8080/api/auth/register";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [value, setValue] = useState(null);
  const [fullName, setFullname] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [allergies, setAllergies] = useState("");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
  ]);
  const handleRegister = async () => {
    if (!username || !fullName || !password || !age || !gender || !allergies) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    const userData = {
      username,
      fullName,
      password,
      age,
      gender,
      allergies,
    };

    try {
      const response = await fetch(mobil, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      console.log(response);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Hata:", errorData);
        Alert.alert("Hata", errorData.message || "Kayıt başarısız.");
      } else {
        const data = await response.json();
        console.log("Başarılı:", data);
        Alert.alert("Başarılı", "Kayıt başarıyla oluşturuldu.");
        router.push("/login");
      }
    } catch (error) {
      Alert.alert("Hata", "Sunucuya bağlanılamadı.");
      console.error(error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
    >
      <Text style={styles.title}>Kayıt Ol</Text>

      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Ad Soyad"
        placeholderTextColor="#888"
        value={fullName}
        onChangeText={setFullname}
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Yaş"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />
      <DropDownPicker
        style={styles.input}
        textStyle={{ color: "#000" }}
        placeholder="Cinsiyet Seçin"
        placeholderStyle={{ color: "#888" }}
        open={open}
        value={gender}
        items={[
          { label: "Kadın", value: "2" },
          { label: "Erkek", value: "1" },
        ]}
        setOpen={setOpen}
        setValue={setGender}
        setItems={setItems}
        listMode="SCROLLVIEW"
        dropDownContainerStyle={{
          borderColor: "#DDD",
          backgroundColor: "#fff",
        }}
      /> 

      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Lütfen sahip olduğunuz alerjen maddeleri yazın"
        placeholderTextColor="#888"
        value={allergies}
        onChangeText={setAllergies}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>

      <Text style={styles.switchText}>
        Zaten hesabın var mı?{" "}
        <Text style={styles.link} onPress={() => router.push("/login")}>
          Giriş Yap
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    color: "#000",
  },
  multiline: { height: 100, textAlignVertical: "top" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  switchText: { marginTop: 15, textAlign: "center", color: "#333" },
  link: { color: "#007AFF", fontWeight: "500" },
  label: {
    marginBottom: 5,
    fontWeight: "500",
    color: "#333",
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#333",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    color: "#000",
    zIndex: 1000, // önemli: açılır liste diğer elemanların üstünde görünsün
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    backgroundColor: "#fff",
    zIndex: 999, // önemli: açılır liste diğer elemanların üstünde görünsün
  },
});
