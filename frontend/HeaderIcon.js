import React from 'react';
import { View, Image } from 'react-native';
import { StyleSheet } from 'react-native';

const HeaderIcon = () => (
  <View style={styles.iconContainer}>
    <Image source={require('./assets/icon_trans.png')} style={styles.icon} />
  </View>
);

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});

export default HeaderIcon;
