// src/navigation/AppNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import POSScreen from "../screens/POSScreen";
import ProductsScreen from "../screens/ProductsScreen";
import SalesScreen from "../screens/SalesScreen";
import CustomersScreen from "../screens/CustomersScreen";
import ReportsScreen from "../screens/ReportsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AIChatScreen from "../screens/AIChatScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          const icons = {
            Dashboard: "view-dashboard",
            POS: "cart",
            Products: "package-variant",
            Sales: "receipt",
            Customers: "account-group",
            Reports: "chart-bar",
            AI: "robot",
            Settings: "cog",
          };
          return <MaterialCommunityIcons name={icons[route.name]} size={18} color={color} />;
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: { height: 42, paddingBottom: 2, paddingTop: 0 },
        tabBarLabelStyle: { fontSize: 8, marginTop: -4 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="POS" component={POSScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Sales" component={SalesScreen} />
      <Tab.Screen name="Customers" component={CustomersScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="AI" component={AIChatScreen} options={{ tabBarLabel: "HDM AI" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { paddingTop: 0, marginTop: 0 } }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={AppTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}