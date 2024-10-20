import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRequest } from './CommunicationUtils';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await makeRequest('Login', JSON.stringify({ email, password }));
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('access_token', data.token);
        setStatus("Login successful!");
        navigation.navigate('PharmacistDashboard');
      } else {
        setStatus(`Login failed: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setStatus("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const debugLoginStore = () => {
    const debugLoginData = {
      email: 'newpharmacy1@example.com',
      password: 'testpassword'
    };
    login(debugLoginData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Login"
        onPress={() => login({ email, password })}
        disabled={loading}
      />
      <Button
        title="Go to Register"
        onPress={() => navigation.navigate('Register')}
        disabled={loading}
      />
      <Button
        title="DEBUG: LOGIN"
        onPress={debugLoginStore}
        disabled={loading}
      />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '80%',
  },
});

export default LoginScreen;
