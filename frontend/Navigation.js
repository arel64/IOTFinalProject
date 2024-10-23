import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import AddMedicine from './AddMedicine';
import GenerateQRCode from './GenerateQRCode';
import Login from './Login';
import Register from './Register';
import CheckoutMedicine from './CheckoutMedicine';
import HomeScreen from './HomeScreen';
import FindMedicine from './FindMedicine';
import PharmacistDashboard from './PharmacistDashboard';
import HeaderIcon from './HeaderIcon';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerStyle: {
          backgroundColor: '#E1F5FE',
        },
        headerTitle: '',
        headerTitleAlign: 'center',
        headerRight: () => (
          <HeaderIcon />
        ),
        headerRightContainerStyle: {
          paddingRight: 15,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
        },
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="AddMedicine" component={AddMedicine} />
      <Stack.Screen name="GenerateQRCode" component={GenerateQRCode} />
      <Stack.Screen name="CheckoutMedicine" component={CheckoutMedicine} />
      <Stack.Screen name="FindMedicine" component={FindMedicine} />
      <Stack.Screen name="PharmacistDashboard" component={PharmacistDashboard} />
    </Stack.Navigator>
  );
}
