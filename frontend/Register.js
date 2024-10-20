import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { makeRequest } from './CommunicationUtils';

const Register = ({ navigation }) => {
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [latitude, setLatitude] = useState(31.99010628788995);
  const [longitude, setLongitude] = useState(34.77442841049924);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const registerStoreAndLogin = async (storeData) => {
    setLoading(true);
    try {
      const response = await makeRequest('RegisterStore', JSON.stringify(storeData));
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('access_token', data.token);
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

  const debugRegisterStores = () => {
    const debugStoreData = {
      storeName: 'Super Pharm Rishon',
      email: 'newpharmacy1@example.com',
      contactNumber: '123-456-7890',
      latitude: '31.99010628788995', 
      longitude: '34.77442841049924',
      password: 'testpassword'
    };
    const debugStoreData1 = {
      storeName: 'Super Pharm Holon',
      email: 'newpharmacy2@example.com',
      contactNumber: '987-654-3210',
      latitude: '32.01235981694784', 
      longitude: '34.77987582094045',
      password: 'testpassword123'
    };
    const debugStoreData2 = {
      storeName: 'Supher Pharm Tel Aviv',
      email: 'samplepharmacy@example.com',
      contactNumber: '555-123-4567',
      latitude: '32.06284224869756', 
      longitude: '34.775723690405066',
      password: 'securepassword'
    };
    registerStoreAndLogin(debugStoreData1);
    registerStoreAndLogin(debugStoreData2);
    registerStoreAndLogin(debugStoreData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>Register Store</Text>
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
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={(e) => {
          const coords = e.nativeEvent.coordinate;
          setLatitude(coords.latitude);
          setLongitude(coords.longitude);
        }}
      >
        <Marker
          coordinate={{ latitude: latitude, longitude: longitude }}
          draggable
          onDragEnd={(e) => {
            const coords = e.nativeEvent.coordinate;
            setLatitude(coords.latitude);
            setLongitude(coords.longitude);
          }}
        />
      </MapView>
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
        title="Register"
        onPress={() => registerStoreAndLogin({ storeName, email, contactNumber, latitude, longitude, password })}
        disabled={loading}
      />
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')}
        disabled={loading}
      />
      <Button
        title="DEBUG: Register stores"
        onPress={debugRegisterStores}
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
  map: {
    width: '100%',
    height: 300,
    marginBottom: 10,
  },
});

export default Register;
