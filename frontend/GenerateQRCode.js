import React, { useState, useRef, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import SvgQRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import { checkTokenStorage } from './TokenUtils';
import { globalStyles, CustomAlert } from './styles';

export default function GenerateQRCode({ navigation }) {
  const [medicineName, setMedicineName] = useState('Aspirin');
  const [manufacturer, setManufacturer] = useState('XYZ Pharma');
  const [expiryDate, setExpiryDate] = useState('2024-12-31');
  const [batchNumber, setBatchNumber] = useState('B12345');
  const [price, setPrice] = useState('4.99');
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [qrData, setQrData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    (async () => {
      await checkTokenStorage(navigation);
    })();
  }, []);

  const generateQRCode = () => {
    const medicine = {
      medicineName,
      manufacturer,
      expiryDate,
      batchNumber,
      price: parseFloat(price),
    };
    setQrData(JSON.stringify(medicine));
    setModalVisible(true);
  };

  const printQRCode = async () => {
    if (qrData) {
      try {
        const uri = await captureRef(qrRef, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
        });
  
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
  
        const html = `
          <html>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
              <div style="text-align: center;">
                <h1>QR Code for ${medicineName}</h1>
                <img src="data:image/png;base64,${base64}" style="width: 200px; height: 200px;" />
              </div>
            </body>
          </html>
        `;
  
        await Print.printAsync({ html });
      } catch (error) {
        console.error(error);
        setAlertTitle('Print Error');
        setAlertMessage('Failed to print QR code. Please try again.');
        setShowAlert(true);
      }
    } else {
      setAlertTitle('No QR Code');
      setAlertMessage('Please generate a QR code first.');
      setShowAlert(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ ...globalStyles.container, flexGrow: 1 }}>
      <TextInput
        style={globalStyles.input}
        placeholder="Medicine Name (required)"
        value={medicineName}
        onChangeText={setMedicineName}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Manufacturer (required)"
        value={manufacturer}
        onChangeText={setManufacturer}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Expiry Date (YYYY-MM-DD) (required)"
        value={expiryDate}
        onChangeText={setExpiryDate}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Batch Number (required)"
        value={batchNumber}
        onChangeText={setBatchNumber}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TouchableOpacity style={globalStyles.button} onPress={generateQRCode}>
        <Text style={globalStyles.buttonText}>Generate QR Code</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('PharmacistDashboard')}
      >
        <Text style={globalStyles.buttonText}>Back</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' }}>
            {qrData && (
              <View collapsable={false} style={{ marginBottom: 20 }} ref={qrRef}>
                <SvgQRCode value={qrData} size={200} />
              </View>
            )}
            <TouchableOpacity style={globalStyles.button} onPress={printQRCode}>
              <Text style={globalStyles.buttonText}>Print QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.button} onPress={() => setModalVisible(false)}>
              <Text style={globalStyles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomAlert
        show={showAlert}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => setShowAlert(false)}
      />
    </ScrollView>
  );
}
