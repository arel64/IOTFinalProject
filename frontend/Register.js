import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { makeRequest } from './CommunicationUtils';
import { globalStyles, mapStyles } from './styles';
import AwesomeAlert from 'react-native-awesome-alerts';
import HeaderIcon from './HeaderIcon'; // Import HeaderIcon

const Register = ({ navigation }) => {
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [latitude, setLatitude] = useState(31.99010628788995);
  const [longitude, setLongitude] = useState(34.77442841049924);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const registerStoreAndLogin = async (storeData) => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await makeRequest('RegisterStore', JSON.stringify(storeData));
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('access_token', data.token);
        setAlertTitle('Success');
        setAlertMessage('Store registered successfully!');
        setShowAlert(true);
        navigation.navigate('PharmacistDashboard');
      } else {
        const errorMessage = await response.text();
        setAlertTitle('Registration Failed');
        setAlertMessage(errorMessage.toString());
        setShowAlert(true);
      }
    } catch (error) {
      console.error(error);
      setAlertTitle('Error');
      setAlertMessage(`An error occurred during registration. ${error}`);
      setShowAlert(true);
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
      password: 'testpassword',
    };
    registerStoreAndLogin(debugStoreData);
  };

  const validateForm = () => {
    const missingFields = [];
    if (!storeName) missingFields.push('Store Name');
    if (!email) missingFields.push('Email');
    if (!contactNumber) missingFields.push('Contact Number');
    if (!password) missingFields.push('Password');

    if (missingFields.length > 0) {
      setAlertTitle('Missing Fields');
      setAlertMessage(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      setShowAlert(true);
      return false;
    }
    return true;
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <View style={{ marginBottom: 200 }}>
        <HeaderIcon />
      </View>

      <Text style={globalStyles.heading}>Register Store</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Store Name (required)"
        value={storeName}
        onChangeText={setStoreName}
      />

      <TextInput
        style={globalStyles.input}
        placeholder="Contact Number (required)"
        value={contactNumber}
        onChangeText={setContactNumber}
        keyboardType="phone-pad"
      />

      <MapView
        style={mapStyles.map}
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
        style={globalStyles.input}
        placeholder="Email (required)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={globalStyles.input}
        placeholder="Password (required)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() =>
          registerStoreAndLogin({ storeName, email, contactNumber, latitude, longitude, password })
        }
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('Login')}
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>Go to Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.button} onPress={debugRegisterStores} disabled={loading}>
        <Text style={globalStyles.buttonText}>DEBUG: Register stores</Text>
      </TouchableOpacity>

      {loading && (
        <View style={globalStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <AwesomeAlert
        show={showAlert}
        title={alertTitle}
        message={alertMessage}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#4CAF50"
        onConfirmPressed={() => setShowAlert(false)}
      />
    </ScrollView>
  );
};

export default Register;
