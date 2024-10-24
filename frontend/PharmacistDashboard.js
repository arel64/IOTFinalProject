import React, { useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles } from './styles';
import {logout} from './TokenUtils'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function PharmacistDashboard({ navigation }) {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        showLogoutAlert();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const showLogoutAlert = () => {
    Alert.alert(
      'Confirm Logout',
      'Do you wish to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            await handleLogout();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleLogout = async () => {
    console.log('Logout process initiated');
    await logout(navigation)
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={showLogoutAlert} style={{ paddingLeft: 10 }}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
