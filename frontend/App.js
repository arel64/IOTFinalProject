import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import AddMedicine from './AddMedicine';

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
  const url = Platform.select({
    ios: "http://localhost:7071/api",
    android: "http://192.168.1.136:7071/api",
  });

  const registerStore = () => {
    const store = {
      storeName: "MyTestStore",
      email: "newpharmacy@example.com",
      contactNumber: "123-456-7890",
      latitude: 35.012071169113796,
      longitude: 34.77936602696631
    };

    fetch(url + "/RegisterStore", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(store)
    }).then((response) => {
      return response.text();
    }).then((text) => {
      setStatus(text);
    }).catch(
      (error) => { console.error(error); }
    );
  };

  const sendImage = async () => {
    try {
      const asset = Asset.fromModule(require('./assets/test.jpg'));
      await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      const base64Img = await readAsStringAsync(uri);
      fetch(url + "/LocateMedicine", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageData: base64Img, imageName: 'medicineSample.jpg' })
      }).then((response) => response.json())
      .then((data) => {
        console.log("Received data:", data); // Add logging
        const newMarkers = data.stores.map(store => ({
          latitude: parseFloat(store.Latitude),
          longitude: parseFloat(store.Longitude),
          title: store.StoreName,
          description: store.Email
        }));
        console.log("Parsed markers:", newMarkers); // Add logging
        setMarkers(newMarkers);
        setStatus("Stores found and markers updated" + JSON.stringify(data));
      }).catch(
        (error) => { console.error(error); }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>Status: {status}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Add Medicine" onPress={() => navigation.navigate('AddMedicine')} />
        <Button title="Register Store" onPress={registerStore} />
        <Button title="Send Image" onPress={sendImage} />
      </View>
      <MapView style={styles.map} initialRegion={{
          latitude: 32.012071169113796,
          longitude: 34.77936602696631,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}>
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddMedicine" component={AddMedicine} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '50%',
  },
});
