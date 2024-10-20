import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Button,
  ActivityIndicator,
  ScrollView,
  Text,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { makeRequest } from './CommunicationUtils';

const GOOGLE_MAPS_APIKEY =
  Platform.OS === 'ios'
    ? Constants.expoConfig.ios.config.googleMapsApiKey
    : Constants.expoConfig.android.config.googleMaps.apiKey;

function FindMedicineScreen() {
  const [markers, setMarkers] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setStatus('Location permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return {
        latitude: 32.012071169113796,
        longitude: 34.77936602696631,
      };
    }
  };

  const sendImage = async (base64Img, imageName) => {
    setLoading(true);
    setMarkers([]);
    setOrigin(null);
    try {
      const response = await makeRequest(
        'LocateMedicine',
        JSON.stringify({ imageData: base64Img, imageName: imageName })
      );
      console.log(response);
      if (!response) return;

      const data = await response.json();
      if (response.ok) {
        setMarkers(
          data.stores.map((store) => ({
            latitude: parseFloat(store.Latitude),
            longitude: parseFloat(store.Longitude),
            title: store.StoreName,
            description: store.Email,
          }))
        );
        console.log(data);
        const loc = await getLocation();
        setOrigin(loc);
        setStatus('Markers and directions updated.');
        console.log('Directions updated');
      } else {
        setStatus(`Failed to locate medicine: ${data.error}`);
      }
    } catch (error) {
      setStatus('An error occurred while sending the image.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendHardcodedImage = async () => {
    try {
      const asset = Asset.fromModule(require('./assets/test.jpg'));
      await asset.downloadAsync();
      const manipResult = await ImageManipulator.manipulateAsync(
        asset.localUri || asset.uri,
        [],
        { base64: true }
      );
      const base64Img = manipResult.base64;
      await sendImage(base64Img, 'medicineSample.jpg');
    } catch (error) {
      setStatus('An error occurred while sending the hardcoded image.');
      console.error(error);
    }
  };

  const handleTakePicture = async () => {
    try {
      let permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        setStatus('Camera permission denied.');
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        base64: true,
        cameraType: ImagePicker.CameraType.back,
      });

      if (!result.cancelled) {
        const base64Img = result.assets[0].base64;
        const imageName = result.assets[0].fileName || result.assets[0].uri.split('/').pop();
        await sendImage(base64Img, imageName);
      }
    } catch (error) {
      setStatus('An error occurred while taking the picture.');
      console.error(error);
    }
  };

  const handleSelectPicture = async () => {
    try {
      let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        setStatus('Media library permission denied.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        base64: true,
      });

      if (!result.cancelled) {
        const base64Img = result.assets[0].base64;
        const imageName = result.assets[0].fileName || result.assets[0].uri.split('/').pop();
        await sendImage(base64Img, imageName);
      }
    } catch (error) {
      setStatus('An error occurred while selecting the picture.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.statusText}>Status: {status}</Text>
      <Button
        title="DEBUG: Send Hardcoded Image"
        onPress={handleSendHardcodedImage}
        disabled={loading}
      />
      <Button
        title="Take Picture and Send"
        onPress={handleTakePicture}
        disabled={loading}
      />
      <Button
        title="Select Picture from Gallery and Send"
        onPress={handleSelectPicture}
        disabled={loading}
      />
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
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
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
