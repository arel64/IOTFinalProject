import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Platform } from 'react-native';

export default function AddMedicine({ navigation }) {
  const [medicineName, setMedicineName] = useState('Aspirin');
  const [manufacturer, setManufacturer] = useState('XYZ Pharma');
  const [expiryDate, setExpiryDate] = useState('2024-12-31');
  const [batchNumber, setBatchNumber] = useState('B12345');
  const [price, setPrice] = useState('4.99');
  const [status, setStatus] = useState(null);

  const url = Platform.select({
    ios: "http://localhost:7071/api",
    android: "http://192.168.1.136:7071/api",
  });

  const addMedicine = (medicine) => {
    fetch(url + "/AddMedicine", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(medicine)
    }).then((response) => {
      return response.text();
    }).then((text) => {
      setStatus(text);
    }).catch(
      (error) => { console.error(error); }
    );
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

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>Status: {status}</Text>
      <TextInput style={styles.input} placeholder="Medicine Name" value={medicineName} onChangeText={setMedicineName} />
      <TextInput style={styles.input} placeholder="Manufacturer" value={manufacturer} onChangeText={setManufacturer} />
      <TextInput style={styles.input} placeholder="Expiry Date" value={expiryDate} onChangeText={setExpiryDate} />
      <TextInput style={styles.input} placeholder="Batch Number" value={batchNumber} onChangeText={setBatchNumber} />
      <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <Button title="Add Medicine" onPress={() => addMedicine({
        medicineName,
        manufacturer,
        expiryDate,
        batchNumber,
        price: parseFloat(price)
      })} />
      <Button title="Add Hardcoded Medicines" onPress={addHardcodedMedicines} />
      <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: '80%',
    paddingHorizontal: 10,
  },
});
