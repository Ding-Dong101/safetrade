import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrderProvider } from './context/OrderContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

import HomeScreen from './screens/HomeScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SearchScreen from './screens/SearchScreen';
import SellScreen from './screens/SellScreen';
import OrdersScreen from './screens/OrdersScreen';
import AccountScreen from './screens/AccountScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import InviteFriendsScreen from './screens/InviteFriendsScreen';
import SettingsScreen from './screens/SettingsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import HelpScreen from './screens/HelpScreen';
import TradeDetailsScreen from './screens/TradeDetailsScreen';
import CartScreen from './screens/CartScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import RiderLoginScreen from './screens/RiderLoginScreen';
import RiderHomeScreen from './screens/RiderHomeScreen';
import RiderMapScreen from './screens/RiderMapScreen';
import RiderWalletScreen from './screens/RiderWalletScreen';
import RiderProfileScreen from './screens/RiderProfileScreen';
import RiderMessagesScreen from './screens/RiderMessagesScreen';
import MessagesScreen from './screens/MessagesScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Sell: undefined;
  Orders: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0F62FE',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopColor: '#E5E7EB',
          paddingTop: 6,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Search') iconName = 'search-outline';
          else if (route.name === 'Sell') iconName = 'add-circle-outline';
          else if (route.name === 'Orders') iconName = 'receipt-outline';
          else if (route.name === 'Account') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Sell" component={SellScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export type RootStackParamList = {
  RiderLogin: undefined;
  RiderHome: undefined;
  RiderMap: { deliveryId: string };
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  ForgotPassword: undefined;
  TradeDetails: { tradeId: string };
  Cart: undefined;
  AdminLogin: undefined;
  AdminDashboard: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Privacy: undefined;
  Help: undefined;
  Notifications: undefined;
  Messages: undefined;
  ChatDetail: { name: string; lastMessage: string };
  RiderWallet: undefined;
  RiderProfile: undefined;
  RiderMessages: undefined;
  InviteFriends: undefined;
  ProductDetail: { productId: string; title: string; price: number; seller: string; placeholderColor: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <OrderProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="TradeDetails" component={TradeDetailsScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="RiderLogin" component={RiderLoginScreen} />
            <Stack.Screen name="RiderHome" component={RiderHomeScreen} />
            <Stack.Screen name="RiderMap" component={RiderMapScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="RiderWallet" component={RiderWalletScreen} />
            <Stack.Screen name="RiderProfile" component={RiderProfileScreen} />
            <Stack.Screen name="RiderMessages" component={RiderMessagesScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
            <Stack.Screen name="InviteFriends" component={InviteFriendsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </OrderProvider>
      <Toast position="top" topOffset={60} />
    </SafeAreaProvider>
  );
}