import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { MaterialIcons } from '@expo/vector-icons';
import { cameraStyles } from './styles';

const ScanQrCodeDesign = ({ onClose, onBarCodeScanned, scanned }) => {
  return (
    <View style={cameraStyles.cameraContainer}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : onBarCodeScanned}
        style={cameraStyles.scannerFillObject}
      />

      <TouchableOpacity style={cameraStyles.closeButton} onPress={onClose}>
        <MaterialIcons name="close" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ScanQrCodeDesign;
