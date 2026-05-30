// src/components/CartItem.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatPrice } from "../utils/formatCurrency";

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>{formatPrice(item.price)} x {item.quantity}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onUpdateQuantity(item._id, -1)} style={styles.qtyBtn}>
          <MaterialCommunityIcons name="minus" size={18} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => onUpdateQuantity(item._id, 1)} style={styles.qtyBtn}>
          <MaterialCommunityIcons name="plus" size={18} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onRemove(item._id)} style={styles.removeBtn}>
          <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "500", color: "#1e293b" },
  price: { fontSize: 12, color: "#888", marginTop: 2 },
  actions: { flexDirection: "row", alignItems: "center", gap: 4 },
  qtyBtn: { padding: 6 },
  quantity: { fontSize: 14, fontWeight: "600", minWidth: 24, textAlign: "center" },
  removeBtn: { padding: 6, marginLeft: 4 },
});