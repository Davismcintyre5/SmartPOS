// src/navigation/AppNavigator.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
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

// Menu Screen - shows all secondary options
function MenuScreen({ navigation }) {
  const menuItems = [
    { name: "Sales", icon: "receipt", screen: "Sales", color: "#10B981", description: "View all transactions" },
    { name: "Customers", icon: "account-group", screen: "Customers", color: "#3B82F6", description: "Manage customer list" },
    { name: "Reports", icon: "chart-bar", screen: "Reports", color: "#F59E0B", description: "View business reports" },
    { name: "Settings", icon: "cog", screen: "Settings", color: "#6B7280", description: "App settings" },
  ];

  return (
    <View style={styles.menuContainer}>
      <View style={styles.menuHeader}>
        <MaterialCommunityIcons name="menu" size={32} color="#2563eb" />
        <Text style={styles.menuTitle}>Menu</Text>
        <Text style={styles.menuSubtitle}>All features</Text>
      </View>
      
      <View style={styles.menuGrid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.menuCard}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
              <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={styles.menuCardTitle}>{item.name}</Text>
            <Text style={styles.menuCardDesc}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Menu Stack - contains Menu screen and all secondary screens
function MenuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MenuMain" component={MenuScreen} />
      <Stack.Screen name="Sales" component={SalesScreen} />
      <Stack.Screen name="Customers" component={CustomersScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: "view-dashboard",
            POS: "cart",
            Products: "package-variant",
            AI: "robot",
            Menu: "menu",
          };
          return <MaterialCommunityIcons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: "#FFFFFF", 
          borderTopColor: "#E5E7EB", 
          paddingTop: 4, 
          height: 60,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="POS" component={POSScreen} options={{ tabBarLabel: "POS" }} />
      <Tab.Screen name="Products" component={ProductsScreen} options={{ tabBarLabel: "Products" }} />
      <Tab.Screen name="AI" component={AIChatScreen} options={{ tabBarLabel: "HDM AI" }} />
      <Tab.Screen name="Menu" component={MenuStack} options={{ tabBarLabel: "Menu" }} />
    </Tab.Navigator>
  );
}

// Loading component
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

export function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={AppTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  menuContainer: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  menuHeader: { alignItems: "center", marginTop: 20, marginBottom: 32 },
  menuTitle: { fontSize: 24, fontWeight: "700", color: "#1e293b", marginTop: 12 },
  menuSubtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  menuCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  menuCardTitle: { fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 4 },
  menuCardDesc: { fontSize: 11, color: "#94a3b8", textAlign: "center" },
});