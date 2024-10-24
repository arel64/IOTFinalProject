import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { makeRequest } from './CommunicationUtils';
import { globalStyles, mapStyles, CustomAlert } from './styles';

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
  const [showMap, setShowMap] = useState(false);

  const registerStoreAndLogin = async (storeData) => {
    if (!validateForm(storeData)) return;
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

  const validateForm = (storeData) => {
    const missingFields = [];
    if (!storeData.storeName) missingFields.push('Store Name');
    if (!storeData.email) missingFields.push('Email');
    if (!storeData.contactNumber) missingFields.push('Contact Number');
    if (!storeData.password) missingFields.push('Password');
    if (!storeData.latitude || !storeData.longitude) missingFields.push('Location');

    if (missingFields.length > 0) {
      setAlertTitle('Missing Fields');
      setAlertMessage(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      setShowAlert(true);
      return false;
    }
    return true;
  };

  const handleSaveLocation = () => {
    setShowMap(false);
  };

  return showMap ? (
    <View style={globalStyles.container}>
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
      <TouchableOpacity style={globalStyles.button} onPress={handleSaveLocation}>
        <Text style={globalStyles.buttonText}>Save Location</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <ScrollView contentContainerStyle={globalStyles.container}>
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

      <TouchableOpacity style={globalStyles.input} onPress={() => setShowMap(true)}>
        <Text style={{ color: '#90A4AE' }}>{latitude && longitude ? `Location:
        (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`: 'Choose Location on Map'}
        </Text>      
      </TouchableOpacity>

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
      <CustomAlert
        show={showAlert}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => {
          setShowAlert(false);
        }}
      />
    </ScrollView>
  );
};

export default Register;
