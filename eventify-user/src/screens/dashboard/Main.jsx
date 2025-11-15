import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  Text,
  ScrollView,
} from 'react-native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import {useDispatch, useSelector} from 'react-redux';
import {getUser} from '../../redux/slices/userSlice';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../../utils/customComponents/customLoader/Loader';

const {width, height} = Dimensions.get('screen');

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
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

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={globalStyles.container}>
      <View style={styles.headerContainer}>
        <Header
          title="Home"
          showSearchBar
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
          <View style={styles.sectionContainer}>
            <Text style={styles.debugText}>Hello</Text>
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: height * 0.1,
  },

  sectionContainer: {
    marginTop: height * 0.04,
    paddingHorizontal: width * 0.06,
  },

  debugText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.regular,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
