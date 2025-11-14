import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('screen');

const Splash = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  // useEffect(() => {
  //   const checkSession = async () => {
  //     try {
  //       await new Promise(resolve => setTimeout(resolve, 1500));

  //       const token = await AsyncStorage.getItem('authToken');
  //       console.log(token);

  //       if (token) {
  //         navigation.reset({
  //           index: 0,
  //           routes: [{name: 'Main'}],
  //         });
  //       } else {
  //         navigation.reset({
  //           index: 0,
  //           routes: [{name: 'OnBoard'}],
  //         });
  //       }
  //     } catch (error) {
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   checkSession();
  // }, []);

  return (
    <SafeAreaView style={[globalStyles.container, styles.primaryContainer]}>
      <View style={styles.secondaryContainer}>
        <Animatable.View
          animation="bounceIn"
          duration={2000}
          style={styles.imgContainer}>
          <Animatable.Image
            source={require('../../assets/splashScreen/splash-logo.png')}
            animation="fadeIn"
            duration={1500}
            style={styles.Img}
          />
        </Animatable.View>
        <Animatable.Text
          animation="fadeInUp"
          duration={1500}
          style={[styles.splashTitle]}>
          MediLink
        </Animatable.Text>
        <Animatable.Text
          animation="fadeInUp"
          duration={2000}
          style={[styles.splashDescription]}>
          Doctor Appointment Booking App
        </Animatable.Text>
      </View>
    </SafeAreaView>
  );
};

export default Splash;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },

  secondaryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(2),
  },

  imgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  Img: {
    width: width * 0.24,
    height: width * 0.24,
  },

  splashTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.roboto.semiBold,
    textAlign: 'center',
    marginTop: height * 0.02,
  },

  splashDescription: {
    fontSize: theme.typography.fontSize.lg,
    textAlign: 'center',
    marginTop: height * 0.01,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
