import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function AddMedicine({ navigation }) {
  const [status, setStatus] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  const url = Platform.select({
    ios: "http://localhost:7071/api",
    android: "http://192.168.0.185:7071/api",
  });

  const checkTokenStorage = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token !== null) {
        console.log('Stored token:', token);
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Check token storage when the component mounts
      await checkTokenStorage();
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={() => BarCodeScanner.requestPermissionsAsync()} title="Grant Permission" />
      </View>
    );
  }

  const addMedicine = async (medicine) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token'); // Retrieve the stored token
      if (!token) {
        console.error('No token found');
        setStatus('No token found');
        setLoading(false);
        return;
      }
      const response = await fetch(url + "/AddMedicine", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        },
        body: JSON.stringify(medicine)
      });

      if (response.status === 401) {
        const data = await response.json();
        if (data.action && data.action === 'redirect_login') {
          navigation.navigate('Auth', { reason: 'token_expired' }); // Redirect to Auth with a reason
            return;
        }
    }

      const text = await response.text();
      setStatus(text);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addHardcodedMedicines = () => {
    const medicines = [
      {
        medicineName: 'Aspirin',
        manufacturer: 'XYZ Pharma',
        expiryDate: '2024-12-31',
        batchNumber: 'B12345',
        price: 4.99
      },
      {
        medicineName: 'Combodex',
        manufacturer: 'Super Pharma',
        expiryDate: '2023-10-01',
        batchNumber: 'B67890',
        price: 9.99
      },
      {
        medicineName: 'Paracetamol',
        manufacturer: 'LMN Pharma',
        expiryDate: '2025-05-15',
        batchNumber: 'C12345',
        price: 3.50
      }
    ];

    medicines.forEach(addMedicine);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    console.log(`QR code detected: ${data}`);
    try {
      const medicine = JSON.parse(data);
      addMedicine(medicine);
      setStatus(`Medicine added: ${JSON.stringify(medicine)}`);
    } catch (error) {
      console.error('Invalid QR code data:', error);
      setStatus('Invalid QR code data');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.statusText}>Status: {status}</Text>
      <View style={styles.buttonContainer}>
        <Button title="DEBUG Add Hardcoded Medicines" onPress={addHardcodedMedicines} disabled={loading} />
        <Button title="Scan QR Code" onPress={() => { setScanned(false); setCameraVisible(true); }} disabled={loading} />
        <Button title="Back to Home" onPress={() => navigation.navigate('Home')} disabled={loading} />
      </View>
      {cameraVisible && !scanned && (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        />
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
  buttonContainer: {
    width: '80%',
    marginBottom: 20,
  },
  buttonWrapper: {
    marginVertical: 10,
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
  message: {
    textAlign: 'center',
    margin: 10,
  },
});
