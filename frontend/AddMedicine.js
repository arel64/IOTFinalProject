import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { checkTokenStorage } from './TokenUtils';
import { makeAuthenticatedRequest } from './CommunicationUtils';
import { globalStyles, cameraStyles, CustomAlert } from './styles'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import ScanQrCodeDesign from './ScanQrCodeDesign';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AddMedicine({ navigation }) {
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);

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

  const addMedicine = async (medicine) => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest(
        'AddMedicine',
        JSON.stringify(medicine),
        navigation,
      );
      const text = await response.text();
      setAlertTitle('Success');
      setAlertMessage(`Medicine added successfully!\n\n
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
      setAlertMessage('An error occurred while adding the medicine.');
      setShowCancelButton(false);
      setShowAlert(true);
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
    if (isAlertActive) return;
    setIsAlertActive(true);
    try {
      const medicine = JSON.parse(data);
      addMedicine(medicine);
    } catch (error) {
      console.error('Invalid QR code data:', error);
      setAlertTitle('Error');
      setAlertMessage('Invalid QR code data');
      setShowCancelButton(false);
      setShowAlert(true);
      setIsAlertActive(false);

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

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setExpiryDate(formattedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      {cameraVisible ? (
        <ScanQrCodeDesign
          onClose={() => setCameraVisible(false)}
          onBarCodeScanned={handleBarCodeScanned}
        />
      ) : manualEntry ? (
        <>
          <View style={globalStyles.inputContainer}>
            <View style={globalStyles.inputIconContainer}>
              <Icon name="pill" size={24} color="#90A4AE" />
            </View>
            <TextInput
              style={[globalStyles.input, globalStyles.inputWithIcon]}
              placeholder="Medicine Name (required)"
              value={medicineName}
              onChangeText={setMedicineName}
              placeholderTextColor="#90A4AE"
            />
          </View>
  
          <View style={globalStyles.inputContainer}>
            <View style={globalStyles.inputIconContainer}>
              <Icon name="factory" size={24} color="#90A4AE" />
            </View>
            <TextInput
              style={[globalStyles.input, globalStyles.inputWithIcon]}
              placeholder="Manufacturer (required)"
              value={manufacturer}
              onChangeText={setManufacturer}
              placeholderTextColor="#90A4AE"
            />
          </View>
  
          <View style={globalStyles.inputContainer}>
            <View style={globalStyles.inputIconContainer}>
              <Icon name="calendar" size={24} color="#90A4AE" />
            </View>
            <TextInput
              style={[globalStyles.input, globalStyles.inputWithIcon]}
              placeholder="Expiry date (YYYY-MM-DD) (required)"
              value={expiryDate}
              onChangeText={setExpiryDate}
              onFocus={() => setShowDatePicker(true)}
              placeholderTextColor="#90A4AE"
            />
            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>
  
          <View style={globalStyles.inputContainer}>
            <View style={globalStyles.inputIconContainer}>
              <Icon name="barcode" size={24} color="#90A4AE" />
            </View>
            <TextInput
              style={[globalStyles.input, globalStyles.inputWithIcon]}
              placeholder="Batch Number (required)"
              value={batchNumber}
              onChangeText={setBatchNumber}
              placeholderTextColor="#90A4AE"
            />
          </View>
  
          <View style={globalStyles.inputContainer}>
            <View style={globalStyles.inputIconContainer}>
              <Icon name="currency-usd" size={24} color="#90A4AE" />
            </View>
            <TextInput
              style={[globalStyles.input, globalStyles.inputWithIcon]}
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholderTextColor="#90A4AE"
            />
          </View>
  
          <TouchableOpacity style={globalStyles.button} onPress={handleManualSubmit}>
            <Text style={globalStyles.buttonText}>Submit</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={globalStyles.button} onPress={() => setManualEntry(false)}>
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={globalStyles.buttonContainer}>
          {/* <TouchableOpacity
            style={globalStyles.button}
            onPress={addHardcodedMedicines}
            disabled={loading}
          >
            <Text style={globalStyles.buttonText}>DEBUG Add Hardcoded Medicines</Text>
          </TouchableOpacity> */}
  
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => setCameraVisible(true)}
            disabled={loading}
          >
            <Icon name="qrcode-scan" size={24} color="white" />
            <Text style={globalStyles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={globalStyles.button} onPress={() => setManualEntry(true)}>
            <Text style={globalStyles.buttonText}>Add Medicine Manually</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => navigation.navigate('PharmacistDashboard')}
            disabled={loading}
          >
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
    onConfirm={() => {
      setShowAlert(false);
      setIsAlertActive(false);
    }}
    onCancel={() => {
      setManualEntry(false);
      setShowAlert(false);
      setIsAlertActive(false);
    }}
    showCancelButton={showCancelButton}
    confirmText={showCancelButton ? 'Yes' : 'OK'}
    cancelText="Return"
    />
    </ScrollView>
  );
}  
