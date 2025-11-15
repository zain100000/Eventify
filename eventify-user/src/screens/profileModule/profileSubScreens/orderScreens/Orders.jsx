import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {theme} from '../../../../styles/theme';
import {globalStyles} from '../../../../styles/globalStyles';
import Header from '../../../../utils/customComponents/customHeader/Header';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import TabBar from '../../../../utils/customComponents/customTabBar/TabBar';
import AllOrders from './orderSubScreens/All';
import ToPayOrders from './orderSubScreens/Pay';
import ToShipOrders from './orderSubScreens/Ship';
import ToReceiveOrders from './orderSubScreens/Recieve';

const {width, height} = Dimensions.get('screen');

const Orders = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    {label: 'All', value: 'all'},
    {label: 'To Pay', value: 'toPay'},
    {label: 'To Prepare', value: 'toShip'},
    {label: 'To Receive', value: 'toReceive'},
  ];

  const handleTabChange = tabValue => {
    setActiveTab(tabValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return <AllOrders />;
      case 'toPay':
        return <ToPayOrders />;
      case 'toShip':
        return <ToShipOrders />;
      case 'toReceive':
        return <ToReceiveOrders />;
      default:
        return <AllOrders />;
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.gradient}>
      <SafeAreaView style={globalStyles.container}>
        <StatusBar backgroundColor={theme.colors.primary} />
        <View style={styles.headerContainer}>
          <Header
            logo={require('../../../../assets/splashScreen/splash-logo.png')}
            title="My Orders"
            leftIcon={require('../../../../assets/icons/chevron-left.png')}
            onPressLeft={() => navigation.goBack()}
          />
        </View>

        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerDescription}>
            You can view your orders from here!
          </Text>
        </View>

        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onTabChange={handleTabChange}
        />

        <View style={styles.contentContainer}>{renderTabContent()}</View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Orders;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  sectionHeaderContainer: {
    padding: height * 0.02,
    paddingHorizontal: width * 0.05,
  },

  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.tertiary,
  },

  headerDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.poppins.regular,
    color: theme.colors.gray,
    marginTop: height * 0.005,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: width * 0.05,
  },
});
