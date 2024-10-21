import React, { useState, useRef, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import SvgQRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import { checkTokenStorage } from './TokenUtils';
import { globalStyles } from './styles';

export default function GenerateQRCode({ navigation }) {
  const [medicineName, setMedicineName] = useState('Aspirin');
  const [manufacturer, setManufacturer] = useState('XYZ Pharma');
  const [expiryDate, setExpiryDate] = useState('2024-12-31');
  const [batchNumber, setBatchNumber] = useState('B12345');
  const [price, setPrice] = useState('4.99');
  const [qrData, setQrData] = useState(null);
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
  };

  const printQRCode = async () => {
    if (qrData) {
      try {
        const uri = await captureRef(qrRef, { format: 'png', quality: 1 });

        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const html = `
          <html>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
              <div style="text-align: center;">
                <img src="data:image/png;base64,${base64}" style="width: 200px; height: 200px;" />
              </div>
            </body>
          </html>
        `;

        await Print.printAsync({ html });
      } catch (error) {
        console.error(error);
        Alert.alert('Print Error', 'Failed to print QR code. Please try again.');
      }
    } else {
      Alert.alert('No QR Code', 'Please generate a QR code first.');
    }
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <Text style={globalStyles.text}>Medicine Name</Text>
      <TextInput
        style={globalStyles.input}
        value={medicineName}
        onChangeText={setMedicineName}
      />
      <Text style={globalStyles.text}>Manufacturer</Text>
      <TextInput
        style={globalStyles.input}
        value={manufacturer}
        onChangeText={setManufacturer}
      />
      <Text style={globalStyles.text}>Expiry Date</Text>
      <TextInput
        style={globalStyles.input}
        value={expiryDate}
        onChangeText={setExpiryDate}
      />
      <Text style={globalStyles.text}>Batch Number</Text>
      <TextInput
        style={globalStyles.input}
        value={batchNumber}
        onChangeText={setBatchNumber}
      />
      <Text style={globalStyles.text}>Price</Text>
      <TextInput
        style={globalStyles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TouchableOpacity style={globalStyles.button} onPress={generateQRCode}>
        <Text style={globalStyles.buttonText}>Generate QR Code</Text>
      </TouchableOpacity>

      {qrData && (
        <View style={styles.qrContainer} collapsable={false} ref={qrRef}>
          <SvgQRCode value={qrData} size={200} />
        </View>
      )}

      <TouchableOpacity style={globalStyles.button} onPress={printQRCode}>
        <Text style={globalStyles.buttonText}>Print QR Code</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('PharmacistDashboard')}>
        <Text style={globalStyles.buttonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
