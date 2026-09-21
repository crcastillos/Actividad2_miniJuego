import { Text, View } from "react-native";
import { copy } from "../copy/es";
import { fonts } from "../styles/fonts";
import { RetroButton } from "./RetroButton";

interface GameOverOverlayProps {
  visible: boolean;
  alias: string;
  score: number;
  wave: number;
  rankingMessage: string;
  onPlayAgain: () => void;
  onHome: () => void;
}

export function GameOverOverlay({
  visible,
  alias,
  score,
  wave,
  rankingMessage,
  onPlayAgain,
  onHome,
}: GameOverOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 items-center justify-center bg-black/75 p-6">
      <View className="w-full max-w-[460px] border-2 border-magenta bg-panel p-6">
        <Text className="text-center text-[16px] text-magenta" style={{ fontFamily: fonts.pixel }}>
          {copy.gameOver.title}
        </Text>
        <Text className="mt-3 text-center text-[20px] text-mist" style={{ fontFamily: fonts.retro }}>
          {copy.gameOver.context}
        </Text>
        <View className="mt-4 border border-mist/20 p-3">
          <Text className="text-[20px] text-cyan" style={{ fontFamily: fonts.retro }}>
            {copy.hud.alias}: {alias}
          </Text>
          <Text className="text-[20px] text-lime" style={{ fontFamily: fonts.retro }}>
            {copy.hud.score}: {score}
          </Text>
          <Text className="text-[20px] text-amber" style={{ fontFamily: fonts.retro }}>
            {copy.hud.wave}: {wave}
          </Text>
          <Text className="text-[20px] text-magenta" style={{ fontFamily: fonts.retro }}>
            {copy.gameOver.lives}
          </Text>
        </View>
        <Text className="mt-3 text-center text-[20px] text-lime" style={{ fontFamily: fonts.retro }}>
          {rankingMessage}
        </Text>
        <Text className="mt-2 text-center text-[18px] text-mist/80" style={{ fontFamily: fonts.retro }}>
          {copy.gameOver.tip}
        </Text>
        <View className="mt-5 gap-3">
          <RetroButton
            label={copy.actions.playAgain}
            accessibilityLabel={copy.a11y.playAgain}
            onPress={onPlayAgain}
          />
          <RetroButton
            label={copy.actions.backHome}
            variant="ghost"
            accessibilityLabel={copy.a11y.backHome}
            onPress={onHome}
          />
        </View>
      </View>
    </View>
  );
}
