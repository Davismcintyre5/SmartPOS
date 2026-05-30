// src/components/ProductCard.js
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { formatPrice } from "../utils/formatCurrency";

export default function ProductCard({ product, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(product)}>
      <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
      <Text style={styles.price}>{formatPrice(product.price)}</Text>
      <Text style={[styles.stock, product.stock <= 5 && styles.lowStock]}>Stock: {product.stock}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "white", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", margin: 4, flex: 1, minWidth: "45%" },
  name: { fontSize: 13, fontWeight: "500", color: "#1e293b" },
  price: { fontSize: 13, color: "#2563eb", fontWeight: "600", marginTop: 4 },
  stock: { fontSize: 11, color: "#888", marginTop: 4 },
  lowStock: { color: "#ef4444" },
});