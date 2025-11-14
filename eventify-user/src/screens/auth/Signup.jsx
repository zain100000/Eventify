import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Dimensions,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import {theme} from '../../styles/theme';
import * as Animatable from 'react-native-animatable';
import {globalStyles} from '../../styles/globalStyles';
import AuthHeader from '../../utils/customComponents/customHeader/AuthHeader';
import InputField from '../../utils/customComponents/customInputField/InputField';
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../utils/customComponents/customButton/Button';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {
  validatePhone,
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from '../../utils/customValidations/Validations';
import ImageUploadModal from '../../utils/customModals/ImageUploadModal';
import Logo from '../../assets/splashScreen/splash-logo.png';
import {registerUser, sendOTP, verifyOTP} from '../../redux/slices/authSlice';
import Toast from 'react-native-toast-message';

const {width, height} = Dimensions.get('screen');

const Signup = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const [resendTimer, setResendTimer] = useState(0);
  const [photoURL, setPhotoURL] = useState('');
  const [newImageURL, setNewImageURL] = useState('');
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const [phoneError, setPhoneError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const steps = ['Phone', 'OTP', 'Details', 'Finalize'];
  const otpRefs = useRef([]);

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.tertiary);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep / steps.length) * 100,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0 && currentStep === 2) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer, currentStep]);

  useEffect(() => {
    if (currentStep === 1) {
      const hasErrors = phoneError || !phone;
      setIsButtonEnabled(!hasErrors);
    } else if (currentStep === 3) {
      const hasErrors =
        phoneError ||
        nameError ||
        emailError ||
        addressError ||
        passwordError ||
        !name ||
        !email ||
        !address ||
        !password;
      setIsButtonEnabled(!hasErrors);
    } else {
      setIsButtonEnabled(true);
    }
  }, [
    currentStep,
    phoneError,
    nameError,
    emailError,
    addressError,
    passwordError,
    phone,
    name,
    email,
    address,
    password,
  ]);

  const handlePhoneChange = text => {
    setPhone(text);
    setPhoneError(validatePhone(text));
  };

  const handleNameChange = value => {
    setName(value);
    setNameError(validateName(value));
  };

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handleAddressChange = value => {
    setAddress(value);
    setAddressError(validateAddress(value));
  };

  const handlePasswordChange = value => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleImagePress = () => {
    setShowImageUploadModal(true);
  };

  const handleImageUpload = url => {
    setShowImageUploadModal(false);
    setNewImageURL(url);
    setPhotoURL(url);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const phoneValidationError = validatePhone(phone);
      setPhoneError(phoneValidationError);

      if (phoneValidationError) return;

      dispatch(sendOTP({phone}))
        .unwrap()
        .then(res => {
          setGeneratedOtp(res.otp);
        });

      setCurrentStep(prev => Math.min(prev + 1, steps.length + 1));
      return;
    }

    if (currentStep === 2) {
      handleVerifyOtp();
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, steps.length + 1));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResendOTP = () => {
    setResendTimer(10);

    const timerInterval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);

          dispatch(sendOTP({phone}))
            .unwrap()
            .then(res => {
              setGeneratedOtp(res.otp);
            });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = () => {
    setLoading(true);

    const enteredOtp = otp.join('');
    dispatch(verifyOTP({phone, otp: enteredOtp}))
      .unwrap()
      .then(res => {
        setLoading(false);

        if (res.success) {
          Toast.show({
            type: 'success',
            text1: 'OTP Verified',
            text2: 'Phone number verified successfully!',
          });
          setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        } else {
          Toast.show({
            type: 'error',
            text1: 'Invalid OTP',
            text2: 'Please enter the correct OTP',
          });
        }
      })
      .catch(err => {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: 'Error verifying OTP. Please try again.',
        });
        console.error('Error verifying OTP:', err);
      });
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        <View style={styles.stepTrack}>
          <Animated.View
            style={[
              styles.stepProgress,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
        {steps.map((step, index) => (
          <Animatable.View
            key={index}
            animation="zoomIn"
            duration={800}
            delay={index * 100}
            style={[
              styles.stepCircle,
              {
                backgroundColor:
                  index + 1 <= currentStep
                    ? theme.colors.primary
                    : theme.colors.gray,
                borderColor: theme.colors.primary,
              },
            ]}>
            <Text
              style={[
                styles.stepText,
                {
                  color:
                    index + 1 <= currentStep
                      ? theme.colors.white
                      : theme.colors.dark,
                },
              ]}>
              {index + 1}
            </Text>
          </Animatable.View>
        ))}
      </View>
    );
  };

  const renderStepLabels = () => {
    return (
      <View style={styles.stepLabelsContainer}>
        {steps.map((step, index) => (
          <Animatable.View
            key={index}
            animation="fadeIn"
            duration={800}
            delay={index * 100}
            style={styles.stepLabel}>
            <Text
              style={[
                styles.stepLabelText,
                {
                  color:
                    index + 1 <= currentStep
                      ? theme.colors.primary
                      : theme.colors.gray,
                  fontFamily:
                    index + 1 === currentStep
                      ? theme.typography.roboto.semiBold
                      : theme.typography.fontFamilyRegular,
                },
              ]}>
              {step}
            </Text>
          </Animatable.View>
        ))}
      </View>
    );
  };

  const renderPhoneStep = () => (
    <Animatable.View
      animation="fadeInRight"
      duration={800}
      style={styles.stepContainer}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.description}>
        Fill in your details to create an account
      </Text>

      <View style={styles.inputContainer}>
        <InputField
          placeholder="Phone"
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType={'number-pad'}
          leftIcon={
            <Feather
              name="phone"
              size={width * 0.044}
              color={theme.colors.primary}
            />
          }
        />
        {phoneError && <Text style={globalStyles.textError}>{phoneError}</Text>}
      </View>

      <Button
        title="NEXT"
        width={width * 0.95}
        onPress={handleNext}
        disabled={!isButtonEnabled}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />
    </Animatable.View>
  );

  const renderOtpStep = () => (
    <Animatable.View
      animation="fadeInRight"
      duration={800}
      delay={200}
      style={styles.stepContainer}>
      <Text style={styles.title}>Verify Phone</Text>
      <Text style={styles.description}>
        We've sent an OTP to your phone number
      </Text>
      <View style={{marginBottom: height * 0.02}}>
        <Text
          style={{
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.lg,
            textAlign: 'center',
            fontFamily: theme.typography.roboto.semiBold,
          }}>
          {generatedOtp}
        </Text>
      </View>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (otpRefs.current[index] = ref)}
            value={digit}
            onChangeText={value => {
              const newOtp = [...otp];
              newOtp[index] = value;
              setOtp(newOtp);

              if (value && index < otp.length - 1) {
                otpRefs.current[index + 1]?.focus();
              }
            }}
            keyboardType="numeric"
            maxLength={1}
            style={[
              styles.otpInputField,
              {
                backgroundColor: digit
                  ? theme.colors.primary
                  : theme.colors.white,
                borderColor: digit ? theme.colors.primary : theme.colors.gray,
                color: digit ? theme.colors.white : theme.colors.dark,
              },
            ]}
            textAlign="center"
          />
        ))}
      </View>
      <TouchableOpacity
        disabled={resendTimer > 0 || loading}
        onPress={handleResendOTP}
        style={[
          styles.resendOtpContainer,
          {
            backgroundColor: theme.colors.primary,
          },
        ]}>
        <Text style={[styles.resendText, {color: theme.colors.white}]}>
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>

      <View style={styles.btnContainer}>
        {currentStep > 1 && currentStep < steps.length && (
          <Button
            title="BACK"
            width={width * 0.44}
            onPress={handleBack}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.white}
          />
        )}
        <Button
          title={
            currentStep === 2
              ? 'VERIFY'
              : currentStep === steps.length
              ? 'CONTINUE'
              : 'NEXT'
          }
          width={
            currentStep === 1 || currentStep === steps.length
              ? width * 0.95
              : width * 0.44
          }
          onPress={handleNext}
          disabled={!isButtonEnabled}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
      </View>
    </Animatable.View>
  );

  const renderDetailStep = () => (
    <Animatable.View
      animation="fadeInRight"
      duration={800}
      delay={200}
      style={styles.stepContainer}>
      <Text style={styles.title}>Personal Details</Text>
      <Text style={styles.description}>
        Please provide your personal information
      </Text>

      <TouchableOpacity
        style={styles.imgContainer}
        activeOpacity={0.9}
        onPress={handleImagePress}>
        {newImageURL || photoURL ? (
          <Image source={{uri: newImageURL || photoURL}} style={styles.image} />
        ) : (
          <Image
            source={require('../../assets/placeholders/default-avatar.png')}
            style={styles.image}
          />
        )}
      </TouchableOpacity>

      <InputField
        placeholder="Full Name"
        value={name}
        onChangeText={handleNameChange}
        leftIcon={
          <Feather
            name="user"
            size={width * 0.05}
            color={theme.colors.primary}
          />
        }
      />
      {nameError && <Text style={globalStyles.textError}>{nameError}</Text>}

      <InputField
        placeholder="Email"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        leftIcon={
          <Feather
            name="mail"
            size={width * 0.05}
            color={theme.colors.primary}
          />
        }
      />
      {emailError && <Text style={globalStyles.textError}>{emailError}</Text>}

      <InputField
        placeholder="House#, Street#, Area, City, LandMark!"
        value={address}
        onChangeText={handleAddressChange}
        leftIcon={
          <Feather
            name="home"
            size={width * 0.05}
            color={theme.colors.primary}
          />
        }
      />
      {addressError && (
        <Text style={globalStyles.textError}>{addressError}</Text>
      )}

      <InputField
        placeholder="Password"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry={hidePassword}
        leftIcon={
          <Feather
            name="lock"
            size={width * 0.05}
            color={theme.colors.primary}
          />
        }
        rightIcon={
          <Feather
            name={hidePassword ? 'eye-off' : 'eye'}
            size={width * 0.054}
            color={theme.colors.primary}
          />
        }
        onRightIconPress={() => setHidePassword(!hidePassword)}
      />
      {passwordError && (
        <Text style={globalStyles.textError}>{passwordError}</Text>
      )}

      <View style={styles.btnContainer}>
        <Button
          title="BACK"
          width={width * 0.44}
          onPress={handleBack}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
        <Button
          title="NEXT"
          width={width * 0.44}
          onPress={handleNext}
          disabled={!isButtonEnabled}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
      </View>
    </Animatable.View>
  );

  const renderFinalStep = () => (
    <Animatable.View
      animation="fadeInRight"
      duration={800}
      delay={200}
      style={styles.stepContainer}>
      <Text style={styles.description}>Click on button to complete signup</Text>

      <Button
        title="SIGN UP"
        width={width * 0.95}
        onPress={handleRegister}
        disabled={!isButtonEnabled}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        loading={loading}
      />
    </Animatable.View>
  );

  const handleRegister = async () => {
    // Validate all fields
    const validationErrors = {
      phone: validatePhone(phone),
      name: validateName(name),
      email: validateEmail(email),
      address: validateAddress(address),
      password: validatePassword(password),
    };

    // Check if any validation errors exist
    const hasErrors = Object.values(validationErrors).some(
      error => error !== '',
    );

    if (hasErrors) {
      // Show first error found
      const firstError = Object.values(validationErrors).find(
        error => error !== '',
      );
      if (firstError) {
        Alert.alert('Validation Error', firstError);
      }
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('phone', phone);
    formData.append('userName', name);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('password', password);

    // Add profile picture if exists
    if (newImageURL) {
      const uriParts = newImageURL.split('/');
      const fileName = uriParts[uriParts.length - 1];
      const fileType = fileName.split('.').pop();
      formData.append('profilePicture', {
        uri: newImageURL,
        name: fileName,
        type: `image/${fileType}`,
      });
    }

    try {
      setLoading(true);

      const resultAction = await dispatch(registerUser(formData));

      if (registerUser.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Registration Succesfull!',
          text2: 'User Registered  Succesfully!',
        });

        setTimeout(() => {
          navigation.replace('Signin');
        }, 3000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed!',
          text2: 'Something Went Wrong!',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error!',
        text2:
          'Could not connect to server. Please check your internet connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return renderPhoneStep();
      case 2:
        return renderOtpStep();
      case 3:
        return renderDetailStep();
      case 4:
        return renderFinalStep();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[globalStyles.container, styles.primaryContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.headerContainer}>
        <AuthHeader logo={Logo} title={'Coffee Spot'} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <View style={styles.stepProgressContainer}>
            {renderStepIndicator()}
            {renderStepLabels()}
          </View>
          {renderContent()}
        </View>
      </ScrollView>

      <ImageUploadModal
        visible={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        onImageUpload={handleImageUpload}
        title="Upload Image!"
        description="Please Choose Your Profile Picture To Upload."
      />
    </KeyboardAvoidingView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
    backgroundColor: theme.colors.tertiary,
  },

  headerContainer: {
    height: height * 0.2,
  },

  scrollContainer: {
    flexGrow: 1,
  },

  formContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    paddingTop: height * 0.04,
    paddingHorizontal: width * 0.024,
    paddingBottom: height * 0.02,
  },

  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.roboto.semiBold,
    textAlign: 'justify',
    marginBottom: height * 0.01,
    color: theme.colors.dark,
    left: width * 0.02,
  },

  description: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    textAlign: 'justify',
    marginBottom: height * 0.02,
    color: theme.colors.dark,
    left: width * 0.02,
  },

  inputContainer: {
    marginBottom: height * 0.044,
    padding: height * 0.001,
  },

  stepContainer: {
    marginBottom: height * 0.02,
  },

  stepProgressContainer: {
    marginTop: height * 0.02,
    marginBottom: height * 0.03,
    paddingHorizontal: width * 0.024,
  },

  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: height * 0.01,
  },

  stepTrack: {
    position: 'absolute',
    height: height * 0,
    width: width * 0.9,
  },

  stepProgress: {
    height: height * 0.002,
  },

  stepCircle: {
    width: width * 0.09,
    height: height * 0.042,
    borderRadius: theme.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 1,
  },

  stepText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.semiBold,
    top: height * 0.003,
  },

  stepLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 0.01,
  },

  stepLabel: {
    width: width * 0.14,
  },

  stepLabelText: {
    fontSize: width * 0.04,
    fontFamily: theme.typography.roboto.regular,
    marginBottom: height * 0.02,
    color: theme.colors.dark,
    alignSelf: 'center',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: height * 0.04,
  },

  otpInputField: {
    width: width * 0.18,
    height: width * 0.18,
    borderWidth: 2,
    borderRadius: 1000,
    fontSize: width * 0.06,
    marginHorizontal: width * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
  },

  resendOtpContainer: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignSelf: 'center',
    width: width * 0.42,
    padding: height * 0.012,
    borderRadius: theme.borderRadius.circle,
  },

  resendText: {
    textAlign: 'center',
    fontFamily: theme.typography.roboto.regular,
    fontSize: theme.typography.fontSize.sm,
  },

  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 0.04,
  },

  imgContainer: {
    marginBottom: height * 0.04,
    alignSelf: 'center',
  },

  image: {
    width: width * 0.24,
    height: width * 0.24,
    borderRadius: (width * 0.4) / 2,
    resizeMode: 'cover',
  },
});
