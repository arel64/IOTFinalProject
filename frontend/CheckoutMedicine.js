import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { checkTokenStorage } from './TokenUtils';
import { makeAuthenticatedRequest } from './CommunicationUtils';
import AwesomeAlert from 'react-native-awesome-alerts';
import { globalStyles, cameraStyles } from './styles';
import ScanQrCodeDesign from './ScanQrCodeDesign';

export default function CheckoutMedicine({ navigation }) {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

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
      const response = await makeAuthenticatedRequest(
        'CheckoutMedicine',
        JSON.stringify(medicine),
        navigation
      );
      const text = await response.text();
  
      setAlertTitle('Success');
      setAlertMessage(text);
      setShowAlert(true);
    } catch (error) {
      console.error(error);
      setAlertTitle('Error');
      setAlertMessage('Failed to checkout medicine.');
      setShowAlert(true);
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
  console.log(`QR code detected: ${data}`);
  try {
    const medicine = JSON.parse(data);
    checkoutMedicine(medicine);
  } catch (error) {
    console.error('Invalid QR code data:', error);
    setAlertTitle('Error');
    setAlertMessage('Invalid QR code data.');
    setShowAlert(true);
  }
};


return (
  <ScrollView contentContainerStyle={globalStyles.container}>
    {cameraVisible ? (
      <ScanQrCodeDesign
        onClose={() => setCameraVisible(false)}
        onBarCodeScanned={handleBarCodeScanned}
      />
    ) : (
      <View style={globalStyles.buttonContainer}>
        <TouchableOpacity style={globalStyles.button} onPress={() => checkoutHardcodedMedicines({ medicineName: 'Aspirin' })}>
          <Text style={globalStyles.buttonText}>DEBUG Checkout Hardcoded Medicine</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.button} onPress={() => setCameraVisible(true)} disabled={loading}>
          <Text style={globalStyles.buttonText}>Scan QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('PharmacistDashboard')} disabled={loading}>
          <Text style={globalStyles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    )}

    {loading && (
      <View style={cameraStyles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )}

    <AwesomeAlert
      show={showAlert}
      title={alertTitle}
      message={alertMessage}
      showConfirmButton={true}
      confirmText="OK"
      confirmButtonColor="#4CAF50"
      onConfirmPressed={() => setShowAlert(false)}
    />
  </ScrollView>
  );
}
