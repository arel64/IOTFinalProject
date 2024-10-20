import React from 'react';
import { StyleSheet, View, Button, ScrollView, Text } from 'react-native';

function PharmacistDashboard({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.statusText}>Pharmacist Dashboard</Text>
      <View style={styles.buttonContainer}>
        <Button 
          title="Add Medicine" 
          onPress={() => navigation.navigate('AddMedicine')} 
        />
        <Button 
          title="Checkout Medicine" 
          onPress={() => navigation.navigate('CheckoutMedicine')} 
        />
        <Button 
          title="Generate QR Code" 
          onPress={() => navigation.navigate('GenerateQRCode')} 
        />
      </View>
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
});

export default PharmacistDashboard;
