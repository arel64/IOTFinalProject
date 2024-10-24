import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {checkTokenStorage, logout} from './TokenUtils'
const URL = Platform.select({
  ios: "https://pharmacy-presentation.azurewebsites.net/api",
  android: "https://pharmacy-presentation.azurewebsites.net/api",
});

export const makeRequest = async (endpointName, json, headers = {}) => {
    const response = await fetch(`${URL}/${endpointName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: json,
    });
    return response;
};

export const makeAuthenticatedRequest = async (endpointName, json, navigation,setStatus) => {
    if(!checkTokenStorage(navigation))
    {
      navigation.navigate('Login');
      setStatus(null)
      return null
    }
    token = await AsyncStorage.getItem('access_token')
    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    const response = await makeRequest(endpointName, json, headers);

    if (response.status == 401) {
      logout(navigation)
      setStatus(null)
      return null;
    }

    return response;
};
