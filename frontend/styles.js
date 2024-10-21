import { StyleSheet } from 'react-native';

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

const cameraStyles = StyleSheet.create({
    cameraContainer: {
      position: 'relative',
      width: '100%',
      height: 300,
    },
    boundingBoxContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    boundingBox: {
      width: 200,
      height: 200,
      borderWidth: 2,
      borderColor: 'red',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  
  export { globalStyles, alertStyles, colors, cameraStyles };
  

