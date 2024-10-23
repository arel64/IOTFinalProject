import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRequest } from './CommunicationUtils';
import { globalStyles, CustomAlert, LoadingAlert } from './styles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await makeRequest('Login', JSON.stringify({ email, password }));
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('access_token', data.token);
        navigation.navigate('PharmacistDashboard');
      } else {
        setAlertTitle('Login Failed');
        setAlertMessage(data.error || 'Unable to login.');
        setShowAlert(true);
      }
    } catch (error) {
      console.error(error);
      setAlertTitle('Error');
      setAlertMessage('An error occurred during login.');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };
  

  const debugLoginStore = () => {
    const debugLoginData = {
      email: 'newpharmacy1@example.com',
      password: 'testpassword'
    };
    login(debugLoginData);
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.heading}>Login</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={globalStyles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={globalStyles.button} 
        onPress={() => login({ email, password })} 
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={globalStyles.button} 
        onPress={() => navigation.navigate('Register')} 
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>Go to Register</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={globalStyles.button} 
        onPress={debugLoginStore} 
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>DEBUG: LOGIN</Text>
      </TouchableOpacity>

      <LoadingAlert show={loading} />

      <CustomAlert
        show={showAlert}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => setShowAlert(false)}
      />
    </View>
  );
};

export default LoginScreen;
