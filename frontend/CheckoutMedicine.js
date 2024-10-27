import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { checkTokenStorage } from './TokenUtils';
import { makeAuthenticatedRequest } from './CommunicationUtils';
import { globalStyles, cameraStyles, CustomAlert } from './styles';
import ScanQrCodeDesign from './ScanQrCodeDesign';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CheckoutMedicine({ navigation }) {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);

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
      setAlertMessage(`Medicine Removed successfully!\n\n
        Name: ${medicine.medicineName}\n
        Manufacturer: ${medicine.manufacturer}\n
        Expiry Date: ${medicine.expiryDate}\n
        Batch Number: ${medicine.batchNumber}\n
        Price: ${medicine.price}`);
      setShowCancelButton(false);
      setShowAlert(true);
    } catch (error) {
      console.error(error);
      setAlertTitle('Error');
      setAlertMessage('Failed to checkout medicine.');
      setShowCancelButton(false);
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
  if (isAlertActive) return;
  setIsAlertActive(true);
  console.log(`QR code detected: ${data}`);
  try {
    const medicine = JSON.parse(data);
    checkoutMedicine(medicine);
  } catch (error) {
    console.error('Invalid QR code data:', error);
    setAlertTitle('Error');
    setAlertMessage('Invalid QR code data.');
    setShowCancelButton(false);
    setShowAlert(true);
    setIsAlertActive(false);

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
        {/* <TouchableOpacity style={globalStyles.button} onPress={() => checkoutHardcodedMedicines({ medicineName: 'Aspirin' })}>
          <Text style={globalStyles.buttonText}>DEBUG Checkout Hardcoded Medicine</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={globalStyles.button} onPress={() => setCameraVisible(true)} disabled={loading}>
            <Icon name="qrcode-scan" size={24} color="white" />
            <Text style={globalStyles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('PharmacistDashboard')} disabled={loading}>
            <Icon name="home" size={24} color="white" />
            <Text style={globalStyles.buttonText}>Back</Text>
          </TouchableOpacity>
      </View>
    )}

    {loading && (
      <View style={cameraStyles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )}

  <CustomAlert
    show={showAlert}
    title={alertTitle}
    message={alertMessage}
    onConfirm={() => 
      {
        setShowAlert(false)
        setIsAlertActive(false);
      }
    }
    onCancel={() => {
      setShowAlert(false);
      setIsAlertActive(false);
    }}
  />
  </ScrollView>
  );
}
