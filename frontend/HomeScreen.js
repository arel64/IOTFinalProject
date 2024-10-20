import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, ScrollView, ActivityIndicator } from 'react-native';
import { checkTokenStorage } from './TokenUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';


function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  
  const handlePharmacistPress = async () => {
    setLoading(true);
    const isAuthenticated = await checkTokenStorage(navigation);
    setLoading(false);

    if (isAuthenticated) {
      navigation.navigate('PharmacistDashboard');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.statusText}>Welcome to the Medicine Finder App</Text>
      <View style={styles.buttonContainer}>
        <Button 
          title="I'm a Client" 
          onPress={() => navigation.navigate('FindMedicine')} 
        />
        <Button 
          title="I'm a Pharmacist" 
          onPress={handlePharmacistPress} 
          disabled={loading} 
        />
        <Button 
          title="Clear Tokens (Debug)" 
          onPress={async () => {
            await AsyncStorage.clear(); 
            console.log('All tokens cleared from AsyncStorage');
            alert('Tokens cleared!');
          }} 
        />
      </View>
      {loading && (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
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

export default HomeScreen;
