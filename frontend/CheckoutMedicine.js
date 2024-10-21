import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { checkTokenStorage } from './TokenUtils';
import { makeAuthenticatedRequest } from './CommunicationUtils';
import { globalStyles, cameraStyles } from './styles'; // Import global and camera styles

export default function CheckoutMedicine({ navigation }) {
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
      <View style={globalStyles.container}>
        <Text style={globalStyles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={globalStyles.button} onPress={() => BarCodeScanner.requestPermissionsAsync()}>
          <Text style={globalStyles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const checkoutMedicine = async (medicine) => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('CheckoutMedicine', JSON.stringify(medicine), navigation, setStatus);
      const text = await response.text();
      setStatus(text);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkoutHardcodedMedicines = () => {
    const medicines = [
      {
        medicineName: 'Aspirin',
        manufacturer: 'XYZ Pharma',
        expiryDate: '2024-12-31',
        batchNumber: 'B12345',
        price: 4.99,
      },
      {
        medicineName: 'Combodex',
        manufacturer: 'Super Pharma',
        expiryDate: '2023-10-01',
        batchNumber: 'B67890',
        price: 9.99,
      },
      {
        medicineName: 'Paracetamol',
        manufacturer: 'LMN Pharma',
        expiryDate: '2025-05-15',
        batchNumber: 'C12345',
        price: 3.50,
      },
    ];

    checkoutMedicine(medicines[0]);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    console.log(`QR code detected: ${data}`);
    try {
      const medicine = JSON.parse(data);
      checkoutMedicine(medicine);
      setStatus(`Medicine checked out: ${JSON.stringify(medicine)}`);
    } catch (error) {
      console.error('Invalid QR code data:', error);
      setStatus('Invalid QR code data');
    }
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <Text style={globalStyles.text}>Status: {status}</Text>
      <View style={globalStyles.buttonContainer}>
        <TouchableOpacity style={globalStyles.button} onPress={checkoutHardcodedMedicines} disabled={loading}>
          <Text style={globalStyles.buttonText}>DEBUG Checkout Hardcoded Medicine</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.button} onPress={() => { setScanned(false); setCameraVisible(true); }} disabled={loading}>
          <Text style={globalStyles.buttonText}>Scan QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('PharmacistDashboard')} disabled={loading}>
          <Text style={globalStyles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {cameraVisible && !scanned && (
        <View style={cameraStyles.cameraContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          />
          <View style={cameraStyles.boundingBoxContainer}>
            <View style={cameraStyles.boundingBox} />
          </View>
        </View>
      )}

      {loading && (
        <View style={cameraStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </ScrollView>
  );
}
