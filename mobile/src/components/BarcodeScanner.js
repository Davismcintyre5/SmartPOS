// src/components/BarcodeScanner.js
import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Audio } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BarcodeScanner({ onScan, enabled = true }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const scannedRef = useRef(false);
  const soundRef = useRef(null);

  // Load sound on component mount
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/scan-beep.mp3")
        );
        soundRef.current = sound;
      } catch (err) {
        console.log("Failed to load sound:", err.message);
      }
    };
    
    loadSound();

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playBeep = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (err) {
      console.log("Play sound error:", err.message);
    }
  };

  const handleBarcodeScanned = ({ data }) => {
    if (scannedRef.current || !enabled) return;
    scannedRef.current = true;
    playBeep();
    if (onScan) onScan(data);
    setTimeout(() => { scannedRef.current = false; }, 2000);
  };

  const startScanning = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setScanning(true);
  };

  if (!scanning) {
    return (
      <TouchableOpacity style={styles.scanButton} onPress={startScanning}>
        <MaterialCommunityIcons name="barcode-scan" size={20} color="#2563eb" />
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
        facing="back"
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <TouchableOpacity style={styles.closeButton} onPress={() => setScanning(false)}>
          <MaterialCommunityIcons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.scanHint}>Point camera at barcode</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#2563eb",
    borderRadius: 10,
    gap: 8,
    marginBottom: 8,
    backgroundColor: "white",
  },
  scanButtonText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
  },
  scannerContainer: {
    height: 280,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  scanArea: {
    width: 200,
    height: 120,
    borderWidth: 2,
    borderColor: "#2563eb",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  scanHint: {
    color: "white",
    fontSize: 12,
    marginTop: 16,
    opacity: 0.8,
    position: "absolute",
    bottom: 20,
  },
});