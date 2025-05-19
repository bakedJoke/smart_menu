import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
const mobil = "http://192.168.43.12:8080/api/recommend";

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ fullName: '', age: '', allergies: '' });
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);

        if (storedToken) {
          const stored = await AsyncStorage.getItem("user");
          if (stored) {
            const parsed = JSON.parse(stored);
            const user = parsed.user || parsed;
            setUserData(user);
          }
        }
      } catch (e) {
        console.error("AsyncStorage okuma hatası:", e);
      }
    };
    loadSession();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setToken(null);
      setUserData(null);
    } catch (e) {
      console.error("Logout hatası:", e);
      Alert.alert("Hata", "Çıkış yapılamadı, lütfen tekrar deneyin.");
    }
  };

  const openEditModal = () => {
    if (!userData) return;
    setForm({
      fullName: userData.fullName,
      age: String(userData.age),
      allergies: userData.allergies,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const updateData = {
        fullName: form.fullName,
        age: Number(form.age),
        allergies: form.allergies,
      };
      const response = await fetch(mobil, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Güncelleme başarısız');
      const updatedUser = await response.json();
      setUserData(updatedUser);
      await AsyncStorage.setItem('userdata', JSON.stringify(updatedUser));
      setModalVisible(false);
      Alert.alert('Başarılı', 'Profil güncellendi');
    } catch (e: any) {
      console.error('Güncelleme hatası:', e);
      Alert.alert('Hata', e.message || 'Güncelleme başarısız');
    }
  };

  // Eğer token yoksa: Giriş / Kayıt butonları
  if (!token) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.title}>Hoşgeldiniz!</Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.authButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.authButton, styles.registerButton]}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.authButtonText}>Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Profil Bilgileri</Text>
          <TouchableOpacity onPress={openEditModal}>
            <FontAwesome name="edit" size={24} color="green" />
          </TouchableOpacity>
        </View>
        {userData ? (
          <View style={styles.infoBox}>
            <Text style={styles.label}>Ad Soyad: <Text style={styles.value}>{userData.fullName}</Text></Text>
            <Text style={styles.label}>Kullanıcı Adı: <Text style={styles.value}>{userData.username}</Text></Text>
            <Text style={styles.label}>Yaş: <Text style={styles.value}>{userData.age}</Text></Text>
            <Text style={styles.label}>Alerjiler: <Text style={styles.value}>{userData.allergies}</Text></Text>
            <Text style={styles.label}>Kayıt Tarihi: <Text style={styles.value}>{new Date(userData.createdAt).toLocaleDateString("tr-TR")}</Text></Text>
            <Text style={styles.label}>Son Güncelleme: <Text style={styles.value}>{new Date(userData.updatedAt).toLocaleDateString("tr-TR")}</Text></Text>
          </View>
        ) : (
          <Text style={styles.loading}>Bilgiler yükleniyor...</Text>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Düzenleme Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profili Düzenle</Text>
            <TextInput
              style={styles.modalInput}
              value={form.fullName}
              onChangeText={(t) => setForm({ ...form, fullName: t })}
              placeholder="Ad Soyad"
            />
            <TextInput
              style={styles.modalInput}
              value={form.age}
              onChangeText={(t) => setForm({ ...form, age: t })}
              placeholder="Yaş"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              value={form.allergies}
              onChangeText={(t) => setForm({ ...form, allergies: t })}
              placeholder="Alerjiler"
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.button, styles.modalButton]} onPress={handleSave}>
                <Text style={styles.buttonText}>Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.modalButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F9F9F9", flexGrow: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
  infoBox: { backgroundColor: "#fff", padding: 18, borderRadius: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3, marginBottom: 30 },
  label: { fontSize: 16, color: "#444", marginBottom: 12 },
  value: { fontWeight: "600", color: "#000" },
  loading: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#888" },
  logoutButton: { backgroundColor: "#FF3B30", paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  authContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#F9F9F9" },
  authButton: { backgroundColor: "#007AFF", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 8, marginTop: 15 },
  registerButton: { backgroundColor: "#34C759" },
  authButtonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, marginBottom: 12, color: '#000' },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, marginHorizontal: 5 },
  button: { // eksik button stili eklendi
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: { // eksik buttonText stili eklendi
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
