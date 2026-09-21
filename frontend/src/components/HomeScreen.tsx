import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { copy } from "../copy/es";
import { fonts } from "../styles/fonts";
import type { ScoreRecord } from "../types/score.types";
import { validateAlias } from "../utils/alias";
import { PlayerForm } from "./PlayerForm";
import { RetroButton } from "./RetroButton";
import { ScoreBoard } from "./ScoreBoard";

interface HomeScreenProps {
  alias: string;
  onChangeAlias: (value: string) => void;
  scores: ScoreRecord[];
  loading: boolean;
  error: boolean;
  muted: boolean;
  onStart: () => void;
  onHelp: () => void;
  onToggleMute: () => void;
}

export function HomeScreen({
  alias,
  onChangeAlias,
  scores,
  loading,
  error,
  muted,
  onStart,
  onHelp,
  onToggleMute,
}: HomeScreenProps) {
  const valid = validateAlias(alias).ok;
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex((current) => (current + 1) % copy.home.rotatingTips.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <View className="w-full items-center bg-void px-4 py-8" style={{ minHeight: "100%" }}>
      <View className="w-full max-w-[960px]">
        <View className="border-2 border-cyan bg-panel p-6">
          <Text className="text-center text-[22px] text-cyan" style={{ fontFamily: fonts.pixel }}>
            {copy.gameName}
          </Text>
          <Text className="mt-3 text-center text-[22px] text-magenta" style={{ fontFamily: fonts.retro }}>
            {copy.tagline}
          </Text>
          <Text className="mt-2 text-center text-[20px] text-mist" style={{ fontFamily: fonts.retro }}>
            {copy.home.context}
          </Text>
        </View>

        <View
          className="mt-5 w-full"
          style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}
        >
          <View
            className="gap-4 border-2 border-lime/40 bg-panel p-5"
            style={{ flexGrow: 1, flexBasis: 320, minWidth: 280 }}
          >
            <PlayerForm alias={alias} onChangeAlias={onChangeAlias} />
            <RetroButton
              label={copy.actions.start}
              disabled={!valid}
              accessibilityLabel={copy.a11y.start}
              onPress={onStart}
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
            <Text className="text-[18px] text-amber" style={{ fontFamily: fonts.retro }}>
              {copy.home.rotatingTips[tipIndex]}
            </Text>
          </View>
          <View style={{ flexGrow: 1, flexBasis: 320, minWidth: 280 }}>
            <ScoreBoard scores={scores} loading={loading} error={error} />
          </View>
        </View>
      </View>
    </View>
  );
}
