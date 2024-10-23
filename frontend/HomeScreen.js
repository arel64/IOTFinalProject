import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { globalStyles, alertStyles } from './styles';

function HomeScreen({ navigation }) {

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <Text style={globalStyles.heading}>Welcome to the Medicine Finder App</Text>

      <View style={globalStyles.buttonContainer}>
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate('FindMedicine')}
        >
          <Text style={globalStyles.buttonText}>I'm a Client</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate('PharmacistDashboard')}
        >
          <Text style={globalStyles.buttonText}>I'm a Pharmacist</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

export default HomeScreen;
