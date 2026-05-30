// src/components/BarcodeScanner.js
import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BarcodeScanner({ onScan, enabled = true }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const scannedRef = useRef(false);

  const playBeep = () => Vibration.vibrate(50);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialCommunityIcons name="camera-off" size={40} color="#888" />
        <Text style={styles.permissionText}>Camera access needed</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }) => {
    if (scannedRef.current || !enabled) return;
    scannedRef.current = true;
    playBeep();
    if (onScan) onScan(data);
    setTimeout(() => { scannedRef.current = false; }, 2000);
  };

  if (!scanning) {
    return (
      <TouchableOpacity style={styles.scanButton} onPress={() => setScanning(true)}>
        <MaterialCommunityIcons name="barcode-scan" size={24} color="#2563eb" />
        <Text style={styles.scanButtonText}>Scan Barcode</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.scannerContainer}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "code128", "code39", "qr"] }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <TouchableOpacity style={styles.closeButton} onPress={() => setScanning(false)}>
            <MaterialCommunityIcons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 200 },
  permissionContainer: { alignItems: "center", justifyContent: "center", padding: 20, height: 200 },
  permissionText: { color: "#888", marginTop: 10, textAlign: "center" },
  permissionButton: { marginTop: 12, backgroundColor: "#2563eb", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  permissionButtonText: { color: "white", fontWeight: "600" },
  scanButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 8, borderWidth: 1, borderColor: "#2563eb", borderRadius: 8, gap: 6, marginBottom: 6 },
  scanButtonText: { color: "#2563eb", fontWeight: "600", fontSize: 13 },
  scannerContainer: { height: 250, borderRadius: 12, overflow: "hidden" },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  scanArea: { width: 250, height: 150, borderWidth: 2, borderColor: "rgba(37,99,235,0.8)", borderRadius: 12 },
  closeButton: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 6 },
});