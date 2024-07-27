import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import MapView from 'react-native-maps';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
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

export default function App() {
  const [status, setStatus] = useState(null);
  const url = Platform.select({
    ios: "http://localhost:7071/api",
    android: "http://192.168.1.136:7071/api",
  });

  const addMedicine = () => {
    const medicine = {
      medicineName: "Aspirin",
      manufacturer: "XYZ Pharma",
      expiryDate: "2024-12-31",
      batchNumber: "B12345",
      price: 4.99
    };

    fetch(url + "/AddMedicine", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(medicine)
    }).then((response) => {
      return response.text();
    }).then((text) => {
      setStatus(text);
    }).catch(
      (error) => { console.error(error); }
    );
  };

  const registerStore = () => {
    const store = {
      storeName: "Super Pharmacy",
      email: "newpharmacy@example.com",
      contactNumber: "123-456-7890",
      latitude: 32.012071169113796,
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
      const asset = Asset.fromModule(require('./assets/test2.jpg'));
      await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      const base64Img = await readAsStringAsync(uri);
      fetch(url + "/GetMedicineNames", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageData: base64Img, imageName: 'medicineSample2.jpg' })
      }).then((response) => {
        return response.text();
      }).then((text) => {
        setStatus(text);
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
        <Button title="Add Medicine" onPress={addMedicine} />
        <Button title="Register Store" onPress={registerStore} />
        <Button title="Send Image" onPress={sendImage} />
      </View>
    </View>
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
    width: '50%',
    height: '50%',
  },
});
