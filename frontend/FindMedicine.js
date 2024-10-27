import React, { useState } from 'react';
import { View, ActivityIndicator,  ScrollView,  Text,  Platform, TouchableOpacity} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { makeRequest } from './CommunicationUtils';
import { globalStyles_client, CustomAlert } from './styles'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const GOOGLE_MAPS_APIKEY =
  Platform.OS === 'ios'
    ? Constants.expoConfig.ios.config.googleMapsApiKey
    : Constants.expoConfig.android.config.googleMaps.apiKey;

function FindMedicineScreen() {
  const [markers, setMarkers] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlertMessage = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        showAlertMessage('Permission Denied', 'Location permission denied');
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
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        setMarkers(
          data.stores.map((store) => ({
            latitude: parseFloat(store.Latitude),
            longitude: parseFloat(store.Longitude),
            title: store.StoreName,
            description: store.Email,
          }))
        );
        const loc = await getLocation();
        setOrigin(loc);
        const status = response.status
        console.log(status)
        if (status === 206 && data.notFoundMedications.length > 0) {
          showAlertMessage(
            'Medicine Not Found',
            `The following medicines were not found: ${data.notFoundMedications.join(', ')}`
          );
        } else {
          showAlertMessage('Success', 'Markers and directions updated.');
        }
      } else {
        showAlertMessage('Failed', `Failed to locate medicine: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      showAlertMessage('Error', 'An error occurred while sending the image.');
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
      showAlertMessage('Error', 'An error occurred while sending the hardcoded image.');
      console.error(error);
    }
  };

  const handleTakePicture = async () => {
    try {
      let permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        showAlertMessage('Permission Denied', 'Camera permission denied.');
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
      showAlertMessage('Error', 'An error occurred while taking the picture.');
      console.error(error);
    }
  };

  const handleSelectPicture = async () => {
    try {
      let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        showAlertMessage('Permission Denied', 'Media library permission denied.');
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
      showAlertMessage('Error', 'An error occurred while selecting the picture.');
      console.error(error);
    }
  };

  return (
      <ScrollView contentContainerStyle={globalStyles_client.container}>
        {/* <TouchableOpacity
          style={globalStyles_client.button}
          onPress={handleSendHardcodedImage}
          disabled={loading}
        >
          <Text style={globalStyles_client.buttonText}>DEBUG: Send Hardcoded Image</Text>
        </TouchableOpacity>
   */}
        <TouchableOpacity style={globalStyles_client.button} onPress={handleTakePicture} disabled={loading}>
          <Icon name="camera" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={globalStyles_client.buttonText}>Take Picture and Send</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={globalStyles_client.button}
          onPress={handleSelectPicture}
          disabled={loading}
        >
          <Text style={globalStyles_client.buttonText}>Select Picture from Gallery and Send</Text>
        </TouchableOpacity>
  
        {origin && (
          <MapView
            style={globalStyles_client.map}
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
          <View style={globalStyles_client.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
  
        <CustomAlert
          show={showAlert}
          title={alertTitle}
          message={alertMessage}
          onConfirm={() => setShowAlert(false)}
        />
      </ScrollView>
  );
}  
export default FindMedicineScreen;
