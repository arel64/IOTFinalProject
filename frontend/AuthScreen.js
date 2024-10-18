import React , { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Platform.select({
  ios: "http://localhost:7071/api",
  android: "http://192.168.1.226:7071/api",
});

function AuthScreen({ navigation, route }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

// Check for reason parameter on mount
useEffect(() => {
  if (route.params?.reason === 'token_expired') {
    setStatus('Your session has expired. Please log in again.');
  } else if (route.params?.reason === 'missing_token') {
    setStatus('No token found. Please log in.');
  }
}, [route.params?.reason]);

  const registerStore = async (storeData) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/RegisterStore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(storeData)
      });
      
      if (response.ok) {
        const data = await response.json();  
        await AsyncStorage.setItem('access_token', data.token); // Store the JWT token
        setStatus("Store registered successfully!");
        navigation.navigate('Home');
      } else {
        const errorMessage = (await response.text()).toString();
        setStatus(`Registration failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error(error);
      setStatus(`An error occurred during registration. ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/Login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('access_token', data.token); // Store the JWT token
        setStatus("Login successful!");
        navigation.navigate('Home');
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

  const debugRegisterStore = () => {
    const debugStoreData = {
      storeName: 'MyTestStore',
      email: 'newpharmacy1@example.com',
      contactNumber: '123-456-7890',
      latitude: '35.012071169113796',
      longitude: '34.77936602696631',
      password: 'testpassword'
    };
    registerStore(debugStoreData);
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
      <Text style={styles.statusText}>{isRegistering ? "Register Store" : "Login"}</Text>
      {isRegistering && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Store Name"
            value={storeName}
            onChangeText={setStoreName}
          />
          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Latitude"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Longitude"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
          />
        </>
      )}
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
        title={isRegistering ? "Register" : "Login"}
        onPress={isRegistering ? () => registerStore({ storeName, email, contactNumber, latitude, longitude, password }) : () => login({ email, password })}
        disabled={loading}
      />
      <Button
        title={isRegistering ? "Switch to Login" : "Switch to Register"}
        onPress={() => setIsRegistering(!isRegistering)}
        disabled={loading}
      />
      <Button
        title="DEBUG: Register Store"
        onPress={debugRegisterStore}
        disabled={loading}
      />
      <Button
        title="DEBUG: Login Store"
        onPress={debugLoginStore}
        disabled={loading}
      />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );
}

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

export default AuthScreen;
