import React from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Home as Home, MapPin, KeyRound, Truck, User, Settings } from 'lucide-react-native';
import { colors } from './constants/colors';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Screens
import LandingScreen from './screens/LandingScreen';
import AuthScreen from './screens/AuthScreen';
import LoginVideoScreen from './screens/LoginVideoScreen';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import MisLlavesScreen from './screens/MisLlavesScreen';
import DeliveryScreen from './screens/DeliveryScreen';
import PerfilScreen from './screens/PerfilScreen';
import AdminDashboard from './screens/admin/AdminDashboard';
import CompanyFormScreen from './screens/admin/CompanyFormScreen';
import EstablishmentDetailScreen from './screens/EstablishmentDetailScreen';
import ProvinceScreen from './screens/ProvinceScreen';
import { navigationRef } from './lib/navigationRef';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.brandDarkSecondary,
          borderTopColor: colors.brandGray,
          borderTopWidth: 0.5,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.brandGold,
        tabBarInactiveTintColor: colors.brandGray,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio', tabBarIcon: ({ size, color }) => <Home size={size} color={color} /> }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Mapa', tabBarIcon: ({ size, color }) => <MapPin size={size} color={color} /> }} />
     <Tab.Screen
  name="MisLlaves"
  component={MisLlavesScreen}
  options={{
    title: '',
    tabBarLabel: 'Mis Llaves',
    tabBarIcon: ({ color }) => (
      <View
        style={{
          position: 'absolute',
          top: -30,
          backgroundColor: colors.brandGold,
          borderRadius: 40,
          padding: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 6,
        }}
      >
        <KeyRound size={28} color={colors.brandDarkSecondary} />
      </View>
    ),
  }}
/>
      <Tab.Screen name="Delivery" component={DeliveryScreen} options={{ title: 'Delivery', tabBarIcon: ({ size, color }) => <Truck size={size} color={color} /> }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil', tabBarIcon: ({ size, color }) => <User size={size} color={color} /> }} />
   {/*}   <Tab.Screen name="Admin" component={AdminDashboard} options={{ title: 'Admin', tabBarIcon: ({ size, color }) => <Settings size={size} color={color} /> }} /> {*/}
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="LoginVideo" component={LoginVideoScreen} />
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="EstablishmentDetail" component={EstablishmentDetailScreen} />
          <Stack.Screen name="Province" component={ProvinceScreen} />
          <Stack.Screen
            name="CompanyForm"
            component={CompanyFormScreen}
            options={{ presentation: 'modal', gestureEnabled: true }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}



// ✅ ESTA ES LA FUNCIÓN PRINCIPAL
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brandDark} />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
