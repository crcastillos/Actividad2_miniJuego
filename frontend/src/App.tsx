import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { isMuted, loadMuted, setMuted, unlock } from "./audio/sfx";
import { GameScreen } from "./components/GameScreen";
import { HelpModal } from "./components/HelpModal";
import { HomeScreen } from "./components/HomeScreen";
import { ToastHost, type ToastItem, type ToastTone } from "./components/Toast";
import { copy } from "./copy/es";
import { fetchScores } from "./services/scoreService";
import { loadSavedAlias, saveAlias } from "./storage/localPlayerStorage";
import "./styles/global.css";
import type { ScoreRecord } from "./types/score.types";
import { validateAlias } from "./utils/alias";

function ensureFonts(): void {
  if (typeof document === "undefined") {
    return;
  }
  if (document.getElementById("neon-fonts")) {
    return;
  }
  const link = document.createElement("link");
  link.id = "neon-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap";
  document.head.appendChild(link);
}

export default function App() {
  const [screen, setScreen] = useState<"home" | "game">("home");
  const [alias, setAlias] = useState("");
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [homeHelp, setHomeHelp] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [muted, setMutedState] = useState(false);

  const pushToast = useCallback((message: string, tone: ToastTone) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const refreshRanking = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchScores(10);
      setScores(data);
      setError(false);
    } catch {
      setError(true);
      pushToast(copy.toasts.rankingError, "error");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    ensureFonts();
    void loadSavedAlias().then((saved) => {
      if (saved) {
        setAlias(saved);
      }
    });
    void loadMuted().then(setMutedState);
    void refreshRanking();
  }, [refreshRanking]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (screen !== "home") {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (event.code === "KeyH" || event.code === "F1") {
        event.preventDefault();
        setHomeHelp((open) => !open);
      }
      if (event.code === "KeyM") {
        event.preventDefault();
        const next = !isMuted();
        setMuted(next);
        setMutedState(next);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen]);

  const startGame = useCallback(() => {
    const result = validateAlias(alias);
    if (!result.ok) {
      return;
    }
    void unlock();
    setAlias(result.value);
    void saveAlias(result.value);
    setScreen("game");
  }, [alias]);

  const toggleMute = useCallback(() => {
    void unlock();
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
  }, []);

  const backHome = useCallback(() => {
    setScreen("home");
    void refreshRanking();
  }, [refreshRanking]);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-void">
        <StatusBar style="light" />
        <View className="flex-1 bg-void">
          {screen === "home" ? (
            <HomeScreen
              alias={alias}
              onChangeAlias={setAlias}
              scores={scores}
              loading={loading}
              error={error}
              onStart={startGame}
              onHelp={() => setHomeHelp(true)}
              muted={muted}
              onToggleMute={toggleMute}
            />
          ) : (
            <GameScreen
              alias={validateAlias(alias).ok ? validateAlias(alias).value : alias.trim()}
              muted={muted}
              onMutedChange={setMutedState}
              onExitHome={backHome}
              onToast={pushToast}
            />
          )}
          <HelpModal visible={homeHelp} onClose={() => setHomeHelp(false)} />
          <ToastHost toasts={toasts} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
