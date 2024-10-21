import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { checkTokenStorage } from './TokenUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AwesomeAlert from 'react-native-awesome-alerts';
import { globalStyles, alertStyles } from './styles';

function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handlePharmacistPress = async () => {
    setLoading(true);
    const isAuthenticated = await checkTokenStorage(navigation);
    setLoading(false);

    if (isAuthenticated) {
      navigation.navigate('PharmacistDashboard');
    }
  };

  const handleClearTokens = async () => {
    await AsyncStorage.clear();
    console.log('All tokens cleared from AsyncStorage');
    setShowAlert(true);
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <Text style={globalStyles.heading}>Welcome to the Medicine Finder App</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={globalStyles.button} 
          onPress={() => navigation.navigate('FindMedicine')}
        >
          <Text style={globalStyles.buttonText}>I'm a Client</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={globalStyles.button} 
          onPress={handlePharmacistPress} 
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>I'm a Pharmacist</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={globalStyles.button} 
          onPress={handleClearTokens}
        >
          <Text style={globalStyles.buttonText}>Clear Tokens (Debug)</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Success"
        message="Tokens cleared!"
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#4CAF50"
        onConfirmPressed={() => setShowAlert(false)}
        titleStyle={alertStyles.alertTitle}
        messageStyle={alertStyles.alertMessage}
        contentContainerStyle={alertStyles.alertContainer}
        confirmButtonStyle={alertStyles.confirmButton}
        confirmButtonTextStyle={alertStyles.confirmButtonText}
        overlayStyle={alertStyles.alertOverlay}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '80%',
    marginBottom: 20,
  },
});

export default HomeScreen;
