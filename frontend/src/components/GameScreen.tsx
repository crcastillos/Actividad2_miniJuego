import { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { isMuted, play, setMuted, stopAll, unlock } from "../audio/sfx";
import { copy } from "../copy/es";
import { GameEngine } from "../game/engine";
import { InputManager } from "../game/input";
import { drawFrame } from "../game/renderer";
import { fetchScores, rankingPosition, saveScore } from "../services/scoreService";
import { fonts } from "../styles/fonts";
import type { GameEvent, GameStatus, HudView } from "../types/game.types";
import { GameCanvas } from "./GameCanvas";
import { GameOverOverlay } from "./GameOverOverlay";
import { HelpModal } from "./HelpModal";
import { Hud } from "./Hud";
import { PauseOverlay } from "./PauseOverlay";
import { RetroButton } from "./RetroButton";
import type { ToastTone } from "./Toast";

interface GameScreenProps {
  alias: string;
  muted: boolean;
  onMutedChange: (value: boolean) => void;
  onExitHome: () => void;
  onToast: (message: string, tone: ToastTone) => void;
}

export function GameScreen({ alias, muted, onMutedChange, onExitHome, onToast }: GameScreenProps) {
  const engineRef = useRef(new GameEngine(alias));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const statusRef = useRef<GameStatus>("playing");
  const confirmingRef = useRef(false);
  const [view, setView] = useState<HudView>(() => engineRef.current.getView());
  const [hintOpacity, setHintOpacity] = useState(1);
  const [rankingMessage, setRankingMessage] = useState(copy.gameOver.missed);
  const [confirmingQuit, setConfirmingQuit] = useState(false);
  const saveLock = useRef(false);
  const playingTime = useRef(0);

  const toggleMute = useCallback(() => {
    const next = !isMuted();
    setMuted(next);
    onMutedChange(next);
  }, [onMutedChange]);

  const leaveHangar = useCallback(() => {
    play("quit");
    stopAll();
    onExitHome();
  }, [onExitHome]);

  const onToastRef = useRef(onToast);
  const leaveHangarRef = useRef(leaveHangar);
  const toggleMuteRef = useRef(toggleMute);
  onToastRef.current = onToast;
  leaveHangarRef.current = leaveHangar;
  toggleMuteRef.current = toggleMute;

  useEffect(() => {
    void unlock();
    play("startGame");
    const engine = engineRef.current;
    const input = new InputManager(engine, { onMuteToggle: () => toggleMuteRef.current() });
    input.attach();
    const onQuitKey = (event: KeyboardEvent) => {
      if (event.code !== "KeyQ" && event.key !== "q" && event.key !== "Q") {
        return;
      }
      event.preventDefault();
      if (engine.getView().status !== "paused") {
        return;
      }
      if (confirmingRef.current) {
        leaveHangarRef.current();
        return;
      }
      confirmingRef.current = true;
      setConfirmingQuit(true);
      engine.setConfirmingLeave(true);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onQuitKey, true);
    }
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
    let last = performance.now();
    let frame = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const events = engine.update(dt);
      if (engine.getView().status === "playing") {
        playingTime.current += dt;
        setHintOpacity(Math.max(0, 1 - playingTime.current / 8));
      }
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        drawFrame(ctx, engine.getSnapshot(), dt);
      }
      const next = engine.getView();
      if (statusRef.current !== next.status) {
        playStatusChange(statusRef.current, next.status);
        statusRef.current = next.status;
        if (next.status !== "paused") {
          confirmingRef.current = false;
          setConfirmingQuit(false);
          engine.setConfirmingLeave(false);
        }
      }
      setView((prev) => (sameView(prev, next) ? prev : { ...next }));
      for (const event of events) {
        playGameEvent(event);
        if (event.type === "extraLife") {
          onToastRef.current(copy.toasts.extraLife, "success");
          canvasRef.current?.focus({ preventScroll: true });
        }
        if (event.type === "waveCleared") {
          onToastRef.current(copy.toasts.waveCleared, "info");
          canvasRef.current?.focus({ preventScroll: true });
        }
        if (event.type === "hit" && (event.lives ?? 0) > 0) {
          onToastRef.current(copy.toasts.hit, "info");
          canvasRef.current?.focus({ preventScroll: true });
        }
      }
      if (engine.consumeCancelConfirm()) {
        confirmingRef.current = false;
        setConfirmingQuit(false);
      }
      if (engine.consumeQuitRequest()) {
        if (confirmingRef.current) {
          leaveHangarRef.current();
        } else {
          confirmingRef.current = true;
          setConfirmingQuit(true);
          engine.setConfirmingLeave(true);
        }
      }
      if (next.status === "gameOver" && !saveLock.current) {
        void persistScore(engine, onToastRef.current, setRankingMessage, saveLock);
      }
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      input.detach();
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", onQuitKey, true);
      }
      stopAll();
      if (typeof document !== "undefined") {
        document.body.style.overflow = "auto";
      }
    };
  }, []);

  function restart(): void {
    saveLock.current = false;
    playingTime.current = 0;
    setHintOpacity(1);
    setRankingMessage(copy.gameOver.missed);
    confirmingRef.current = false;
    setConfirmingQuit(false);
    engineRef.current.restart();
    statusRef.current = "playing";
    setView(engineRef.current.getView());
    play("startGame");
  }

  return (
    <View className="min-h-full w-full items-center bg-void px-4 py-4">
      <View className="w-full max-w-[960px] gap-3">
        <Hud view={view} />
        {view.status === "playing" ? (
          <View className="flex-row justify-end gap-3">
            <RetroButton
              label={copy.actions.pause}
              variant="amber"
              accessibilityLabel={copy.a11y.pause}
              onPress={() => engineRef.current.pause()}
            />
            <RetroButton
              label={copy.actions.help}
              variant="magenta"
              accessibilityLabel={copy.a11y.help}
              onPress={() => engineRef.current.toggleHelp()}
            />
          </View>
        ) : null}
        <View className="relative items-center">
          <GameCanvas canvasRef={canvasRef} />
          {hintOpacity > 0 && view.status === "playing" ? (
            <View className="absolute bottom-6 items-center px-4" style={{ opacity: hintOpacity, pointerEvents: "none" }}>
              <Text className="text-center text-[20px] text-cyan" style={{ fontFamily: fonts.retro }}>
                {copy.overlay.hint}
              </Text>
              <Text className="text-center text-[16px] text-mist" style={{ fontFamily: fonts.retro }}>
                {copy.overlay.hintDetail}
              </Text>
            </View>
          ) : null}
          <PauseOverlay
            visible={view.status === "paused"}
            confirmingQuit={confirmingQuit}
            muted={muted}
            onResume={() => engineRef.current.resume()}
            onRestart={restart}
            onHelp={() => engineRef.current.toggleHelp()}
            onQuit={() => {
              confirmingRef.current = true;
              setConfirmingQuit(true);
              engineRef.current.setConfirmingLeave(true);
            }}
            onConfirmQuit={leaveHangar}
            onCancelQuit={() => {
              confirmingRef.current = false;
              setConfirmingQuit(false);
              engineRef.current.setConfirmingLeave(false);
            }}
            onToggleMute={toggleMute}
          />
          <GameOverOverlay
            visible={view.status === "gameOver"}
            alias={view.alias}
            score={view.score}
            wave={view.wave}
            rankingMessage={rankingMessage}
            onPlayAgain={restart}
            onHome={() => {
              stopAll();
              onExitHome();
            }}
          />
        </View>
      </View>
      <HelpModal visible={view.status === "help"} onClose={() => engineRef.current.closeHelp()} />
    </View>
  );
}

function playGameEvent(event: GameEvent): void {
  switch (event.type) {
    case "playerShot":
      play("playerShot");
      return;
    case "enemyShot":
      play("enemyShot");
      return;
    case "moveStart":
      play("moveStart");
      return;
    case "enemyDestroyed":
      if (event.enemyType === "tank") {
        play("enemyDestroyedTank");
      } else if (event.enemyType === "fast") {
        play("enemyDestroyedFast");
      } else {
        play("enemyDestroyedBasic");
      }
      return;
    case "hit":
      play("hit");
      return;
    case "extraLife":
      play("extraLife");
      return;
    case "waveCleared":
      play("waveCleared");
      return;
    case "gameOver":
      play("gameOver");
      return;
    default:
      return;
  }
}

function playStatusChange(from: GameStatus, to: GameStatus): void {
  if (to === "paused" && from === "playing") {
    play("pause");
  }
  if (to === "playing" && (from === "paused" || from === "help")) {
    play("resume");
  }
}

function sameView(a: HudView, b: HudView): boolean {
  return (
    a.status === b.status &&
    a.alias === b.alias &&
    a.score === b.score &&
    a.lives === b.lives &&
    a.wave === b.wave
  );
}

async function persistScore(
  engine: GameEngine,
  onToast: (message: string, tone: ToastTone) => void,
  setRankingMessage: (message: string) => void,
  saveLock: { current: boolean },
): Promise<void> {
  const payload = engine.consumeGameOverSave();
  if (!payload || saveLock.current) {
    return;
  }
  saveLock.current = true;
  try {
    const created = await saveScore(payload);
    const ranking = await fetchScores(10);
    const position = rankingPosition(ranking, created.id);
    if (position) {
      setRankingMessage(copy.gameOver.ranked(position, Math.max(ranking.length, 10)));
    } else {
      setRankingMessage(copy.gameOver.missed);
    }
    onToast(copy.toasts.scoreSaved, "success");
  } catch {
    setRankingMessage(copy.gameOver.missed);
    onToast(copy.toasts.scoreError, "error");
  }
}
