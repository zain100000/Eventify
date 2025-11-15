import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {theme} from '../styles/theme';

// Shared Screens
import Splash from '../screens/shared/Splash';

// Auth Screens
import Signin from '../screens/auth/Signin';
import Signup from '../screens/auth/Signup';
import BottomNavigator from './bottomNavigator/BottomNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [statusBarColor, setStatusBarColor] = useState(theme.colors.primary);

  return (
    <>
      <StatusBar backgroundColor={statusBarColor} barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName="Splash">
        {/* Shared Routes */}
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        {/* Auth Routes */}
        <Stack.Screen name="Signin">
          {props => <Signin {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Signup">
          {props => <Signup {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        
        {/* Dashboard Routes */}
        <Stack.Screen name="Main">
          {props => <BottomNavigator {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
