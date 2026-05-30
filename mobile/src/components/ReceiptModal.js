// src/components/ReceiptModal.js
import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatPrice } from "../utils/formatCurrency";

export default function ReceiptModal({ visible, sale, businessName, onClose, onPrint }) {
  if (!sale) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="check-circle" size={40} color="#16a34a" />
            <Text style={styles.title}>Payment Successful</Text>
          </View>
          <ScrollView style={styles.receipt}>
            <Text style={styles.businessName}>{businessName || "SmartPOS"}</Text>
            <Text style={styles.date}>{new Date().toLocaleString()}</Text>
            <Text style={styles.receiptNumber}>Receipt: #{sale.receiptNumber?.slice(-6) || sale._id?.slice(-6)}</Text>
            {sale.customerName ? <Text style={styles.customer}>Customer: {sale.customerName}</Text> : null}
            <View style={styles.divider} />
            {sale.items?.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name || "Item"} x{item.quantity}</Text>
                <Text style={styles.itemPrice}>{formatPrice((item.price || 0) * (item.quantity || 1))}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.itemRow}><Text>Subtotal</Text><Text>{formatPrice(sale.subtotal || 0)}</Text></View>
            {sale.discount > 0 && <View style={[styles.itemRow, { color: "#16a34a" }]}><Text>Discount</Text><Text>-{formatPrice(sale.discount)}</Text></View>}
            <View style={styles.divider} />
            <View style={styles.itemRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{formatPrice(sale.total || 0)}</Text></View>
            <Text style={styles.paymentMethod}>Payment: {sale.paymentMethod}</Text>
            {sale.amountPaid && <View style={styles.itemRow}><Text>Paid: {formatPrice(sale.amountPaid)}</Text><Text>Change: {formatPrice(sale.changeAmount || 0)}</Text></View>}
            <Text style={styles.thanks}>Thank you for shopping!</Text>
          </ScrollView>
          <View style={styles.buttons}>
            {onPrint && (
              <TouchableOpacity style={styles.printBtn} onPress={onPrint}>
                <MaterialCommunityIcons name="printer" size={20} color="#2563eb" />
                <Text style={styles.printBtnText}>Print</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modal: { backgroundColor: "white", borderRadius: 16, maxHeight: "80%", padding: 20 },
  header: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginTop: 8 },
  receipt: { marginBottom: 16 },
  businessName: { textAlign: "center", fontWeight: "700", fontSize: 16, color: "#2563eb" },
  date: { textAlign: "center", fontSize: 10, color: "#888", marginTop: 4 },
  receiptNumber: { textAlign: "center", fontSize: 10, color: "#888" },
  customer: { textAlign: "center", fontSize: 10, color: "#888" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 8 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 2 },
  itemName: { fontSize: 12, color: "#1e293b" },
  itemPrice: { fontSize: 12, color: "#1e293b" },
  totalLabel: { fontWeight: "700", fontSize: 14 },
  totalValue: { fontWeight: "700", fontSize: 14, color: "#2563eb" },
  paymentMethod: { fontSize: 10, color: "#888", marginTop: 4 },
  thanks: { textAlign: "center", color: "#888", marginTop: 12, fontSize: 12 },
  buttons: { flexDirection: "row", gap: 12 },
  printBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, borderWidth: 1, borderColor: "#2563eb", borderRadius: 10 },
  printBtnText: { color: "#2563eb", fontWeight: "600" },
  doneBtn: { flex: 1, backgroundColor: "#2563eb", padding: 12, borderRadius: 10, alignItems: "center" },
  doneBtnText: { color: "white", fontWeight: "600" },
});