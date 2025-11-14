import React, {useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../../styles/theme';
import Header from '../../../utils/customComponents/customHeader/Header';
import {globalStyles} from '../../../styles/globalStyles';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');

const TermsAndConditions = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={{flex: 1}}>
      <SafeAreaView style={[globalStyles.container, styles.primaryContainer]}>
        <View style={styles.headerContainer}>
          <Header
            logo={require('../../../assets/splashScreen/splash-logo.png')}
            title="Terms & Conditions"
            leftIcon={require('../../../assets/icons/chevron-left.png')}
            onPressLeft={() => navigation.goBack()}
          />
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitleText, {color: theme.colors.white}]}>
            Terms and Conditions
          </Text>
          <Text
            style={[styles.headerDescriptionText, {color: theme.colors.white}]}>
            Rules and guidelines for using Coffee Spot.
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={[styles.heading, {color: theme.colors.white}]}>
            Introduction
          </Text>
          <Text style={[styles.description, {color: theme.colors.white}]}>
            By accessing and using Coffee Spot, you agree to comply with these
            Terms and Conditions. Please read them carefully before making any
            purchases or using our services.
          </Text>

          <Text style={[styles.heading, {color: theme.colors.white}]}>
            User Responsibilities
          </Text>
          <Text style={[styles.description, {color: theme.colors.white}]}>
            Users must provide accurate information, respect intellectual
            property rights, and comply with applicable laws while using Coffee
            Spot.
          </Text>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="person-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Ensure your account details remain confidential and do not share
              your credentials with others.
            </Text>
          </View>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Any misuse of the platform may result in account suspension or
              termination.
            </Text>
          </View>

          <Text style={[styles.heading, {color: theme.colors.white}]}>
            Purchases and Payments
          </Text>
          <Text style={[styles.description, {color: theme.colors.white}]}>
            All purchases made through Coffee Spot are subject to availability,
            pricing, and applicable taxes. Payments must be completed securely
            through our supported payment methods.
          </Text>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="card-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Refunds and cancellations are subject to our Refund Policy.
            </Text>
          </View>

          <Text style={[styles.heading, {color: theme.colors.white}]}>
            Limitation of Liability
          </Text>
          <Text style={[styles.description, {color: theme.colors.white}]}>
            Coffee Spot is not responsible for any indirect, incidental, or
            consequential damages resulting from the use of our platform.
          </Text>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="shield-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Users agree to use the platform at their own risk.
            </Text>
          </View>

          <Text style={[styles.heading, {color: theme.colors.white}]}>
            Contact Us
          </Text>
          <Text style={[styles.description, {color: theme.colors.white}]}>
            If you have any questions regarding these Terms and Conditions,
            please reach out to us at:
          </Text>
          <View style={styles.contactContainer}>
            <Ionicons
              name="mail-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.contactIcon}
            />
            <Text style={[styles.contactText, {color: theme.colors.white}]}>
              support@coffeespot.com
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default TermsAndConditions;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
  },

  headerTextContainer: {
    marginTop: height * 0.04,
    marginHorizontal: width * 0.04,
  },

  headerTitleText: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.roboto.bold,
  },

  headerDescriptionText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
  },

  contentContainer: {
    marginTop: height * 0.02,
    marginHorizontal: width * 0.04,
    paddingBottom: height * 0.05,
  },

  heading: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.roboto.semiBold,
    marginVertical: height * 0.02,
  },

  description: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    marginBottom: height * 0.02,
    lineHeight: theme.typography.lineHeight.md,
    textAlign: 'justify',
  },

  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    marginHorizontal: width * 0.04,
  },

  bulletIcon: {
    right: width * 0.05,
  },

  bulletText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    lineHeight: theme.typography.lineHeight.md,
    textAlign: 'justify',
    flex: 1,
  },

  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
    marginTop: height * 0.03,
  },

  contactIcon: {
    marginRight: width * 0.03,
  },

  contactText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    lineHeight: theme.typography.lineHeight.md,
  },
});
