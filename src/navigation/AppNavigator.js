import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ConfirmSignUpScreen from '../screens/auth/ConfirmSignUpScreen';
import HomeScreen from '../screens/home/HomeScreen';
import VacationListScreen from '../screens/vacations/VacationListScreen';
import VacationDetailScreen from '../screens/vacations/VacationDetailScreen';
import CreateVacationScreen from '../screens/vacations/CreateVacationScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ConfirmSignUp" component={ConfirmSignUpScreen} />
    </Stack.Navigator>
  );
}

// Vacation Stack Navigator
function VacationStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="VacationList"
        component={VacationListScreen}
        options={{ title: 'My Vacations' }}
      />
      <Stack.Screen
        name="VacationDetail"
        component={VacationDetailScreen}
        options={{ title: 'Vacation Details' }}
      />
      <Stack.Screen
        name="CreateVacation"
        component={CreateVacationScreen}
        options={{ title: 'Create Vacation' }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: () => null, // Add icons later
        }}
      />
      <Tab.Screen
        name="Vacations"
        component={VacationStack}
        options={{
          title: 'Vacations',
          headerShown: false,
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: () => null,
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
