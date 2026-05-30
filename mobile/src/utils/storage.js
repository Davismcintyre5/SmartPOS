// src/utils/storage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  get: async (key) => {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  set: async (key, value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  remove: async (key) => {
    await AsyncStorage.removeItem(key);
  },
  clear: async () => {
    await AsyncStorage.multiRemove(["smartpos_token", "smartpos_user", "smartpos_clientId"]);
  },
};