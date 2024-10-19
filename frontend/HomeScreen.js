import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, ScrollView } from 'react-native';

function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.statusText}>Welcome to the Medicine Finder App</Text>
      <View style={styles.buttonContainer}>
        <Button title="Add Medicine" onPress={() => navigation.navigate('AddMedicine')} disabled={loading} />
        <Button title="Generate QR Code" onPress={() => navigation.navigate('GenerateQRCode')} disabled={loading} />
        <Button title="Checkout Medicine" onPress={() => navigation.navigate('CheckoutMedicine')} disabled={loading} />
        <Button title="Find Medicine" onPress={() => navigation.navigate('FindMedicine')} disabled={loading} />
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

export default HomeScreen;
