import { StyleSheet } from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const colors = {
    primary: '#4FC3F7',
    secondary: '#81D4FA',
    background: '#E1F5FE',
    text: '#01579B',
    muted: '#90A4AE',
    confirmButton: '#4CAF50',
    overlay: 'rgba(0, 0, 0, 0.75)',
    inputBackground: '#FFFFFF',
    inputBorder: '#B0BEC5',
    placeholderText: '#90A4AE',
};

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.inputBackground,
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
    marginVertical: hp('1.5%'),
    borderWidth: 1,
    borderColor: colors.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    fontSize: wp('4%'),
    color: colors.text,
  },
  inputContainer: {
    width: '100%',
    marginBottom: hp('3%'),
  },
  inputIconContainer: {
    position: 'absolute',
    left: wp('4%'),
    top: hp('1.5%'),
  },
  inputWithIcon: {
    paddingLeft: wp('12%'),
  },
  button: {
    backgroundColor: colors.primary,
    padding: hp('2%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    marginVertical: hp('1.5%'),
  },
  buttonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  iconContainer: {
    position: 'absolute',
    top: hp('3%'),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,  
  },
  icon: {
    width: wp('15%'),
    height: undefined,
    resizeMode: 'contain',
    aspectRatio: 1,
  },
  heading: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: hp('2%'),
    textAlign: 'center',
  },
  text: {
    fontSize: wp('4%'),
    color: colors.text,
    marginBottom: hp('2%'),
  },
  mutedText: {
    fontSize: wp('3.5%'),
    color: colors.muted,
    marginBottom: hp('1%'),
  },
});

const alertStyles = StyleSheet.create({
  alertContainer: {
    backgroundColor: colors.background,
    borderRadius: wp('3%'),
    padding: wp('5%'),
  },
  alertTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  alertMessage: {
    fontSize: wp('4%'),
    color: colors.muted,
    textAlign: 'center',
    marginBottom: hp('3%'),
  },
  confirmButton: {
    backgroundColor: colors.confirmButton,
    borderRadius: wp('2%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
  },
  confirmButtonText: {
    color: 'white',
    fontSize: wp('4%'),
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
    height: hp('50%'),
  },
  scannerFillObject: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: hp('5%'),
    right: wp('5%'),
    zIndex: 1,
  },
});

const mapStyles = StyleSheet.create({
  map: {
    width: '100%',
    height: hp('30%'),
    marginBottom: hp('2%'),
  },
});

const globalStyles_client = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    padding: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#29B6F6',
    padding: hp('2%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    marginVertical: hp('1.5%'),
  },
  buttonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: wp('4%'),
    marginBottom: hp('2%'),
    textAlign: 'center',
    color: '#0288D1',
    width: '80%',
  },
  map: {
    width: '100%',
    height: hp('30%'),
    marginBottom: hp('2%'),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export {
  globalStyles,
  alertStyles,
  colors,
  cameraStyles,
  mapStyles,
  globalStyles_client,
  CustomAlert,
  LoadingAlert,
};
