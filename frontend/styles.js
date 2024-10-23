import { StyleSheet } from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';

const colors = {
  primary: '#4FC3F7',
  secondary: '#81D4FA',
  background: '#E1F5FE',
  text: '#01579B',
  muted: '#90A4AE',
  confirmButton: '#4CAF50',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: colors.text,
  },
  mutedText: {
    fontSize: 14,
    color: colors.muted,
  },
});

const alertStyles = StyleSheet.create({
  alertContainer: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 20,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 18,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: colors.confirmButton,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  alertOverlay: {
    backgroundColor: colors.overlay,
  },
});

const CustomAlert = ({ show, title, message, onConfirm }) => (
    <AwesomeAlert
      show={show}
      title={title}
      message={message}
      showConfirmButton={true}
      confirmText="OK"
      confirmButtonColor={colors.confirmButton}
      onConfirmPressed={onConfirm}
      titleStyle={alertStyles.alertTitle}
      messageStyle={alertStyles.alertMessage}
      contentContainerStyle={alertStyles.alertContainer}
    />
  );
  
const LoadingAlert = ({ show }) => (
    <AwesomeAlert
        show={show}
        showProgress={true}
        title="Logging in..."
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showConfirmButton={false}
    />
);

const cameraStyles = StyleSheet.create({
    cameraContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    scannerFillObject: {
        ...StyleSheet.absoluteFillObject,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20, // Adjust for left if needed
        zIndex: 1,
    },
});

const mapStyles = StyleSheet.create({
    map: {
      width: '100%',
      height: 300,
      marginBottom: 10,
    },
});

const globalStyles_client = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E0F7FA',
      padding: 20,
    },
    button: {
      backgroundColor: '#29B6F6',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 8,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    statusText: {
      fontSize: 18,
      marginBottom: 20,
      textAlign: 'center',
      color: '#0288D1',
      width: '80%',
    },
    map: {
      width: '100%',
      height: 300,
      marginBottom: 20,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
});
  
  export { globalStyles, alertStyles, colors, cameraStyles, mapStyles, globalStyles_client, CustomAlert, LoadingAlert };
