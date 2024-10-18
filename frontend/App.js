import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Platform, ActivityIndicator, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import AddMedicine from './AddMedicine';
import GenerateQRCode from './GenerateQRCode';
import AuthScreen from './AuthScreen';
import CheckoutMedicine from './CheckoutMedicine';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Platform.select({
  ios: "http://localhost:7071/api",
  android: "http://192.168.1.226:7071/api",
});

async function readAsStringAsync(fileUri) {
  if (Platform.OS === 'web') {
    return await readFileAsStringWeb(fileUri);
  } else {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error(`File at ${fileUri} does not exist`);
    }
    const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
    return base64;
  }
}

function readFileAsStringWeb(fileUri) {
  return new Promise((resolve, reject) => {
    fetch(fileUri)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result.split(',')[1]); // Extract base64 string
        };
        reader.onerror = () => {
          reject(reader.error);
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => reject(error));
  });
}

function HomeScreen({ navigation }) {
  const [status, setStatus] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const validateToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/ValidateToken`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  };

  const makeAuthenticatedRequest = async (url, options) => {
    try {
      let token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setStatus("No access token found. Please log in.");
        navigation.navigate('Auth');
        return null;
      }

      const tokenIsValid = await validateToken(token);
      if (!tokenIsValid) {
        setStatus("Token expired. Please log in again.");
        navigation.navigate('Auth');
        return null;
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });

      return response;
    } catch (error) {
      console.error("Error making authenticated request:", error);
      setStatus("An error occurred while making the request.");
      return null;
    }
  };

  const sendImage = async () => {
    setLoading(true);
    try {
      const asset = Asset.fromModule(require('./assets/test.jpg'));
      await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      const base64Img = await readAsStringAsync(uri);

      const response = await makeAuthenticatedRequest(`${API_URL}/LocateMedicine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageData: base64Img, imageName: 'medicineSample.jpg' })
      });

      if (!response) return; 

      const data = await response.json();
      if (response.ok) {
        setMarkers(data.stores.map(store => ({
          latitude: parseFloat(store.Latitude),
          longitude: parseFloat(store.Longitude),
          title: store.StoreName,
          description: store.Email,
        })));
        setStatus("Stores found and markers updated");
      } else {
        setStatus(`Failed to locate medicine: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setStatus("An error occurred while sending the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.statusText}>Status: {status}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Add Medicine" onPress={() => navigation.navigate('AddMedicine')} disabled={loading} />
        <Button title="Generate QR Code" onPress={() => navigation.navigate('GenerateQRCode')} disabled={loading} />
        <Button title="Send Image" onPress={sendImage} disabled={loading} />
        <Button title="Checkout Medicine" onPress={() => navigation.navigate('CheckoutMedicine')} disabled={loading} />
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 32.012071169113796,
          longitude: 34.77936602696631,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </ScrollView>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddMedicine" component={AddMedicine} />
        <Stack.Screen name="GenerateQRCode" component={GenerateQRCode} />
        <Stack.Screen name="CheckoutMedicine" component={CheckoutMedicine} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    width: '80%',
  },
  buttonContainer: {
    width: '80%',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
