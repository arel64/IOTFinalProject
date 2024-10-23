import React from 'react';
import { View, Image } from 'react-native';
import { globalStyles } from './styles';

const HeaderIcon = () => (
  <View style={globalStyles.iconContainer}>
    <Image source={require('./assets/icon_trans.png')} style={globalStyles.icon} />
  </View>
);

export default HeaderIcon;
