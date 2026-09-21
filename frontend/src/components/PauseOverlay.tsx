import { Text, View } from "react-native";
import { copy } from "../copy/es";
import { fonts } from "../styles/fonts";
import { RetroButton } from "./RetroButton";

interface PauseOverlayProps {
  visible: boolean;
  confirmingQuit: boolean;
  muted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHelp: () => void;
  onQuit: () => void;
  onConfirmQuit: () => void;
  onCancelQuit: () => void;
  onToggleMute: () => void;
}

export function PauseOverlay({
  visible,
  confirmingQuit,
  muted,
  onResume,
  onRestart,
  onHelp,
  onQuit,
  onConfirmQuit,
  onCancelQuit,
  onToggleMute,
}: PauseOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 items-center justify-center bg-black/70 p-6" style={{ zIndex: 40 }}>
      <View className="w-full max-w-[420px] border-2 border-amber bg-panel p-6">
        {confirmingQuit ? (
          <>
            <Text className="text-center text-[16px] text-amber" style={{ fontFamily: fonts.pixel }}>
              {copy.quit.confirmTitle}
            </Text>
            <Text className="mt-3 text-center text-[20px] text-mist" style={{ fontFamily: fonts.retro }}>
              {copy.quit.context}
            </Text>
            <Text className="mt-2 text-center text-[18px] text-mist/80" style={{ fontFamily: fonts.retro }}>
              {copy.quit.tip}
            </Text>
            <View className="mt-4 gap-2">
              <RetroButton
                label={copy.actions.quit}
                variant="ghost"
                accessibilityLabel={copy.a11y.quit}
                onPress={onConfirmQuit}
              />
              <RetroButton
                label={copy.actions.stay}
                accessibilityLabel={copy.a11y.stay}
                onPress={onCancelQuit}
              />
            </View>
          </>
        ) : (
          <>
            <Text className="text-center text-[16px] text-amber" style={{ fontFamily: fonts.pixel }}>
              {copy.pause.title}
            </Text>
            <Text className="mt-3 text-center text-[20px] text-mist" style={{ fontFamily: fonts.retro }}>
              {copy.pause.context}
            </Text>
            <Text className="mt-2 text-center text-[18px] text-mist/80" style={{ fontFamily: fonts.retro }}>
              {copy.pause.tip}
            </Text>
            <View className="mt-4 gap-2">
              <RetroButton label={copy.actions.resume} accessibilityLabel={copy.a11y.resume} onPress={onResume} />
              <RetroButton
                label={copy.actions.restart}
                variant="amber"
                accessibilityLabel={copy.a11y.restart}
                onPress={onRestart}
              />
              <RetroButton
                label={copy.actions.help}
                variant="magenta"
                accessibilityLabel={copy.a11y.help}
                onPress={onHelp}
              />
              <RetroButton
                label={muted ? copy.actions.soundOff : copy.actions.soundOn}
                variant="ghost"
                accessibilityLabel={muted ? copy.a11y.soundOff : copy.a11y.soundOn}
                onPress={onToggleMute}
              />
              <RetroButton
                label={copy.actions.quit}
                variant="ghost"
                accessibilityLabel={copy.a11y.quit}
                onPress={onQuit}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}
