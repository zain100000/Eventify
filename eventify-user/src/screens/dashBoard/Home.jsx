import React, {useEffect, useState, useMemo} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import {useDispatch, useSelector} from 'react-redux';
import {getUser} from '../../redux/slices/userSlice';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ProductCard from '../../utils/customComponents/customCards/productCards/ProductCard';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../../utils/customComponents/customLoader/Loader';

const {width, height} = Dimensions.get('screen');

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector(state => state.auth.user);
  const userProfile = useSelector(state => state.user.user);

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUser(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    let newGreeting = '';
    if (hour < 12) newGreeting = 'Good Morning';
    else if (hour < 17) newGreeting = 'Good Afternoon';
    else newGreeting = 'Good Evening';
    setGreeting(newGreeting);
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={globalStyles.container}>
      <View style={styles.headerContainer}>
        <Header
          logo={require('../../assets/splashScreen/splash-logo.png')}
          title="CoffeeSpot"
          onPressRight={handleChatNavigate}
          rightIcon={
            <FontAwesome5
              name="headset"
              size={width * 0.06}
              color={theme.colors.white}
            />
          }
        />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.greetingContainer}>
            <View style={styles.greetingLeftContainer}>
              <Text style={styles.greetingTitle}>{greeting}!</Text>
            </View>
            <View style={styles.greetingRightContainer}>
              <TouchableOpacity activeOpacity={0.8}>
                <Image
                  source={
                    userProfile?.profilePicture
                      ? {uri: userProfile.profilePicture}
                      : require('../../assets/placeholders/default-avatar.png')
                  }
                  style={styles.profileImage}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.eventSection}>
            <View style={styles.sectionContainer}>
              <Text>Hello Motherfker</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  greetingContainer: {
    marginTop: height * 0.04,
    paddingHorizontal: width * 0.06,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  greetingTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.roboto.semiBold,
    color: theme.colors.white,
  },

  profileImage: {
    width: width * 0.16,
    height: height * 0.076,
    resizeMode: 'cover',
    borderRadius: theme.borderRadius.circle,
  },

  scrollContent: {
    paddingBottom: height * 0.1,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
