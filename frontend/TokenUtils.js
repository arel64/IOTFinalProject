import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkTokenStorage = async (navigation) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      console.error('No token found');
      navigation.navigate('Login', { reason: 'missing_token' });
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return false;
  }
};
export const logout =  async (navigation) => {
  await AsyncStorage.removeItem('access_token');
  navigation.navigate('Login');
  return true
}
