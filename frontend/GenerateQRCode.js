import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import SvgQRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';

export default function GenerateQRCode({ navigation }) {
  const [medicineName, setMedicineName] = useState('Aspirin');
  const [manufacturer, setManufacturer] = useState('XYZ Pharma');
  const [expiryDate, setExpiryDate] = useState('2024-12-31');
  const [batchNumber, setBatchNumber] = useState('B12345');
  const [price, setPrice] = useState('4.99');
  const [qrData, setQrData] = useState(null);
  const qrRef = useRef(null);

  const generateQRCode = () => {
    const medicine = {
      medicineName,
      manufacturer,
      expiryDate,
      batchNumber,
      price: parseFloat(price)
    };
    setQrData(JSON.stringify(medicine));
  };

  const printQRCode = async () => {
    if (qrData) {
      try {
        const uri = await captureRef(qrRef, {
          format: 'png',
          quality: 1
        });

        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64
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
    <View style={styles.container}>
      <Text style={styles.label}>Medicine Name</Text>
      <TextInput
        style={styles.input}
        value={medicineName}
        onChangeText={setMedicineName}
      />
      <Text style={styles.label}>Manufacturer</Text>
      <TextInput
        style={styles.input}
        value={manufacturer}
        onChangeText={setManufacturer}
      />
      <Text style={styles.label}>Expiry Date</Text>
      <TextInput
        style={styles.input}
        value={expiryDate}
        onChangeText={setExpiryDate}
      />
      <Text style={styles.label}>Batch Number</Text>
      <TextInput
        style={styles.input}
        value={batchNumber}
        onChangeText={setBatchNumber}
      />
      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <Button title="Generate QR Code" onPress={generateQRCode} />
      {qrData && (
        <View style={styles.qrContainer} collapsable={false} ref={qrRef}>
          <SvgQRCode value={qrData} size={200} />
        </View>
      )}
      <Button title="Print QR Code" onPress={printQRCode} />
      <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
