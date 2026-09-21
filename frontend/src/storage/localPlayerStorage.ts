import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "neon-swarm.player-alias";

export async function loadSavedAlias(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(KEY)) ?? "";
  } catch {
    return "";
  }
}

export async function saveAlias(alias: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, alias);
  } catch {
    // Local persistence is optional; the game still works without it.
  }
}
