// hooks/useBarcodeScanner.js — add beep sound after scan
import { useState, useEffect, useCallback, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import beepSound from "../assets/sounds/scan-beep.mp3";

export const useBarcodeScanner = ({ onScan, enabled = true, cameraEnabled = false }) => {
  const [buffer, setBuffer] = useState("");
  const bufferRef = useRef("");
  const timeoutRef = useRef(null);
  const audioRef = useRef(new Audio(beepSound));

  const playBeep = () => {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  // External scanner (HID keyboard)
  const handleKeyDown = useCallback(
    (e) => {
      if (!enabled || cameraEnabled) return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (bufferRef.current.length > 3) {
          playBeep();
          onScan(bufferRef.current);
        }
        bufferRef.current = "";
        setBuffer("");
        return;
      }
      if (e.key.length === 1) {
        bufferRef.current += e.key;
        setBuffer((prev) => prev + e.key);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          bufferRef.current = "";
          setBuffer("");
        }, 100);
      }
    },
    [enabled, cameraEnabled, onScan]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeoutRef.current);
    };
  }, [handleKeyDown]);

  // Camera scanner
  useEffect(() => {
    if (!cameraEnabled || !enabled) return;

    const codeReader = new BrowserMultiFormatReader();

    const startCamera = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) return;

        let deviceId = videoInputDevices[0].deviceId;
        for (const device of videoInputDevices) {
          const label = device.label.toLowerCase();
          if (label.includes("back") || label.includes("rear") || label.includes("environment")) {
            deviceId = device.deviceId;
            break;
          }
        }

        codeReader.decodeFromVideoDevice(deviceId, "camera-preview", (result, err) => {
          if (result) {
            playBeep();
            onScan(result.getText());
          }
        });
      } catch (error) {
        console.warn("Camera error:", error.message);
      }
    };

    startCamera();

    return () => {
      codeReader.reset();
    };
  }, [cameraEnabled, enabled, onScan]);

  const resetBuffer = useCallback(() => {
    bufferRef.current = "";
    setBuffer("");
  }, []);

  return { buffer, resetBuffer, cameraEnabled };
};