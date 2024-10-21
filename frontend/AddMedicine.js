import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { checkTokenStorage } from './TokenUtils';
import { makeAuthenticatedRequest } from './CommunicationUtils';
import { globalStyles, cameraStyles } from './styles'; 
import AwesomeAlert from 'react-native-awesome-alerts';

export default function AddMedicine({ navigation }) {
  const [status, setStatus] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [price, setPrice] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showCancelButton, setShowCancelButton] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      await checkTokenStorage(navigation);
    })();
  }, []);

  const handleManualSubmit = async () => {
    if (!validateForm()) return;
    const medicine = {
      medicineName,
      manufacturer,
      expiryDate,
      batchNumber,
      price: parseFloat(price),
    };
    await addMedicine(medicine);
    setAlertTitle('Successfully added medicine!');
    setAlertMessage('Do you want to add another one?');
    setShowCancelButton(true);
    setShowAlert(true);
  };

  const resetForm = () => {
    setMedicineName('');
    setManufacturer('');
    setExpiryDate('');
    setBatchNumber('');
    setPrice('');
  };

  const addMedicine = async (medicine) => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest(
        'AddMedicine',
        JSON.stringify(medicine),
        navigation,
        setStatus
      );
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
      { medicineName: 'Aspirin', manufacturer: 'XYZ Pharma', expiryDate: '2024-12-31', batchNumber: 'B12345', price: 4.99 },
      { medicineName: 'Combodex', manufacturer: 'Super Pharma', expiryDate: '2023-10-01', batchNumber: 'B67890', price: 9.99 },
      { medicineName: 'Paracetamol', manufacturer: 'LMN Pharma', expiryDate: '2025-05-15', batchNumber: 'C12345', price: 3.50 },
    ];
    medicines.forEach(addMedicine);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    try {
      const medicine = JSON.parse(data);
      addMedicine(medicine);
      setStatus(`Medicine added: ${JSON.stringify(medicine)}`);
    } catch (error) {
      console.error('Invalid QR code data:', error);
      setStatus('Invalid QR code data');
    }
  };

  const validateForm = () => {
    const missingFields = [];
    if (!medicineName) missingFields.push('Medicine Name');
    if (!manufacturer) missingFields.push('Manufacturer');
    if (!expiryDate) missingFields.push('Expiry Date');
    if (!batchNumber) missingFields.push('Batch Number');

    if (missingFields.length > 0) {
      setAlertTitle('Please fill all the data required');
      setAlertMessage(`The data missing is: ${missingFields.join(', ')}`);
      setShowCancelButton(false);
      setShowAlert(true);
      return false;
    }
    return true;
  };

  if (hasPermission === null) return <View />;
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

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <Text style={globalStyles.text}>Status: {status}</Text>

      {manualEntry ? (
        <>
          <TextInput style={globalStyles.input} placeholder="Medicine Name (required)" value={medicineName} onChangeText={setMedicineName} />
          <TextInput style={globalStyles.input} placeholder="Manufacturer (required)" value={manufacturer} onChangeText={setManufacturer} />
          <TextInput style={globalStyles.input} placeholder="Expiry Date (YYYY-MM-DD) (required)" value={expiryDate} onChangeText={setExpiryDate} />
          <TextInput style={globalStyles.input} placeholder="Batch Number (required)" value={batchNumber} onChangeText={setBatchNumber} />
          <TextInput style={globalStyles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />

          <TouchableOpacity style={globalStyles.button} onPress={handleManualSubmit}>
            <Text style={globalStyles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.button} onPress={() => setManualEntry(false)}>
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={globalStyles.buttonContainer}>
          <TouchableOpacity style={globalStyles.button} onPress={addHardcodedMedicines} disabled={loading}>
            <Text style={globalStyles.buttonText}>DEBUG Add Hardcoded Medicines</Text>
          </TouchableOpacity>

          <TouchableOpacity style={globalStyles.button} onPress={() => { setScanned(false); setCameraVisible(true); }} disabled={loading}>
            <Text style={globalStyles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={globalStyles.button} onPress={() => setManualEntry(true)}>
            <Text style={globalStyles.buttonText}>Add Medicine Manually</Text>
          </TouchableOpacity>

          <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('PharmacistDashboard')} disabled={loading}>
            <Text style={globalStyles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {cameraVisible && !scanned && (
        <View style={cameraStyles.cameraContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
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
        showCancelButton={showCancelButton}
        confirmText={showCancelButton ? 'Yes' : 'OK'}
        cancelText="Return"
        confirmButtonColor="#4CAF50"
        cancelButtonColor="#F44336"
        onConfirmPressed={() => {
          if (showCancelButton) resetForm();
          setShowAlert(false);
        }}
        onCancelPressed={() => {
          setManualEntry(false);
          setShowAlert(false);
        }}
      />
    </ScrollView>
  );
}
