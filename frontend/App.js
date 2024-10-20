import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AddMedicine from './AddMedicine';
import GenerateQRCode from './GenerateQRCode';
import Login from './Login'
import Register from './Register'
import CheckoutMedicine from './CheckoutMedicine';
import HomeScreen from './HomeScreen';
import FindMedicine from './FindMedicine';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="AddMedicine" component={AddMedicine} />
        <Stack.Screen name="GenerateQRCode" component={GenerateQRCode} />
        <Stack.Screen name="CheckoutMedicine" component={CheckoutMedicine} />
        <Stack.Screen name="FindMedicine" component={FindMedicine} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
