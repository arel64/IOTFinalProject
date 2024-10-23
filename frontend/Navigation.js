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
import HeaderIcon from './HeaderIcon'; // Import HeaderIcon

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerTitle: () => <HeaderIcon />, // Set HeaderIcon as the title
        headerTitleAlign: 'center', // Align the icon to the center
        headerStyle: {
          backgroundColor: '#E1F5FE', // Optional: Customize header background
        },
      }}
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
