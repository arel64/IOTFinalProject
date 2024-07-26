import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

async function readAsStringAsync(fileUri) {
  if (Platform.OS === 'web') {
    return await readFileAsStringWeb(fileUri);
  } else {
    return await FileSystem.readAsStringAsync(fileUri, 'base64');
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
  const url = "http://localhost:7071/api";

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
      storeName: "New Pharmacy",
      email: "newpharmacy@example.com",
      contactNumber: "123-456-7890"
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
      const uri = "/assets/test2.jpg";
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
  },
});
