import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [allergies, setAllergies] = useState('');

  const handleRegister = () => {
    if (!username || !email || !password || !allergies) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const userData = {
      username,
      email,
      password,
      allergies, // Örneğin: "Gluten, Süt, Fıstık"
    };

    // API isteği burada yapılabilir
    console.log('Kayıt Verisi:', userData);
    Alert.alert('Başarılı', 'Kayıt başarılı!');
    // navigation.navigate('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="E-posta"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Lütfen sahip olduğunuz alerjen maddeleri yazın"
        value={allergies}
        onChangeText={setAllergies}
        multiline
      />

      <Button title="Kayıt Ol" onPress={handleRegister} />

      <Text style={styles.switchText}>
        Zaten hesabın var mı?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Giriş Yap
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  switchText: { marginTop: 15, textAlign: 'center' },
  link: { color: 'blue' },
});
