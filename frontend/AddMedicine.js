import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { checkTokenStorage } from './TokenUtils';
import { makeAuthenticatedRequest } from './CommunicationUtils';
export default function AddMedicine({ navigation }) {
  const [status, setStatus] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      await checkTokenStorage(navigation);
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
      const response = await makeAuthenticatedRequest('AddMedicine', JSON.stringify(medicine),navigation,setStatus);
      if (!response)
        setStatus(null);  
      
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
        <Button title="Back " onPress={() => navigation.navigate('PharmacistDashboard')} disabled={loading} />
      </View>
      {cameraVisible && !scanned && (
        <View style={styles.cameraContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          />
          <View style={styles.boundingBoxContainer}>
            <View style={styles.boundingBox} />
          </View>
        </View>
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
  cameraContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  boundingBoxContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boundingBox: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'red',
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
