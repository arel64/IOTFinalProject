import React, { useState } from 'react';
import { StyleSheet, View, Button, ActivityIndicator, ScrollView, Text, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOOGLE_MAPS_APIKEY = Constants.expoConfig.android.config.googleMaps.apiKey;
const API_URL = Platform.select({
  ios: "http://localhost:7071/api",
  android: "http://192.168.1.226:7071/api",
});

async function readAsStringAsync(fileUri) {
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) throw new Error(`File at ${fileUri} does not exist`);
  return await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
}

function FindMedicineScreen({ navigation }) {
  const [markers, setMarkers] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("Location permission denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      return { latitude: location.coords.latitude, longitude: location.coords.longitude };
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return { latitude: 32.012071169113796, longitude: 34.77936602696631 };
    }
  };
  const makeAuthenticatedRequest = async (url, options) => {
    let token = await AsyncStorage.getItem('access_token');
    if (!token) {
      setStatus("No access token found. Please log in.");
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

    if (response.status == 401) {
      navigation.navigate('Auth');
      await AsyncStorage.removeItem('access_token');
      return null;
    }

    return response;
  };

  const sendImage = async () => {
    setLoading(true);
    setMarkers([]);
    setOrigin(null);
    try {
      const asset = Asset.fromModule(require('./assets/test.jpg'));
      await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      const base64Img = await readAsStringAsync(uri);

      const response = await makeAuthenticatedRequest(`${API_URL}/LocateMedicine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: base64Img, imageName: 'medicineSample.jpg' }),
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
        console.log(data)
        const loc = await getLocation()
        setOrigin(loc);
        setStatus("Markers and directions updated.");
        console.log("Directions updated");
      } else {
        setStatus(`Failed to locate medicine: ${data.error}`);
      }
    } catch (error) {
      setStatus("An error occurred while sending the image.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.statusText}>Status: {status}</Text>
      <Button title="DEUBUG: Send Image" onPress={sendImage} disabled={loading} />
      {origin && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: origin.latitude,
            longitude: origin.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <MapViewDirections
            origin={origin}
            destination={origin}
            waypoints={markers}
            
            apikey={GOOGLE_MAPS_APIKEY}
          />
          {markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={marker.title}
              description={marker.description}
            />
          ))}
        </MapView>
      )}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </ScrollView>
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

export default FindMedicineScreen;
