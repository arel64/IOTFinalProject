import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from './styles';

function PharmacistDashboard({ navigation }) {
  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <Text style={globalStyles.heading}>Pharmacist Dashboard</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={globalStyles.button} 
          onPress={() => navigation.navigate('AddMedicine')}
        >
          <Text style={globalStyles.buttonText}>Add Medicine</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={globalStyles.button} 
          onPress={() => navigation.navigate('CheckoutMedicine')}
        >
          <Text style={globalStyles.buttonText}>Checkout Medicine</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={globalStyles.button} 
          onPress={() => navigation.navigate('GenerateQRCode')}
        >
          <Text style={globalStyles.buttonText}>Generate QR Code</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = {
  buttonContainer: {
    width: '80%',
    marginBottom: 20,
  },
};

export default PharmacistDashboard;
