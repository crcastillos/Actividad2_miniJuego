import { ActivityIndicator, Text, View } from "react-native";
import { copy } from "../copy/es";
import { fonts } from "../styles/fonts";
import type { ScoreRecord } from "../types/score.types";

interface ScoreBoardProps {
  scores: ScoreRecord[];
  loading: boolean;
  error: boolean;
}

export function ScoreBoard({ scores, loading, error }: ScoreBoardProps) {
  return (
    <View className="border-2 border-magenta/50 bg-panel/80 p-4">
      <Text className="mb-2 text-[14px] text-magenta" style={{ fontFamily: fonts.pixel }}>
        {copy.ranking.title}
      </Text>
      {loading ? (
        <View className="items-center py-6">
          <ActivityIndicator color="#F472B6" />
          <Text className="mt-2 text-[18px] text-mist" style={{ fontFamily: fonts.retro }}>
            {copy.ranking.loading}
          </Text>
        </View>
      ) : null}
      {error ? (
        <Text className="text-[18px] text-amber" style={{ fontFamily: fonts.retro }}>
          {copy.ranking.error}
        </Text>
      ) : null}
      {!loading && !error && scores.length === 0 ? (
        <Text className="text-[18px] text-mist" style={{ fontFamily: fonts.retro }}>
          {copy.ranking.empty}
        </Text>
      ) : null}
      {!loading && !error
        ? scores.slice(0, 5).map((item, index) => (
            <View key={item.id} className="flex-row items-center justify-between py-1">
              <Text className="text-[20px] text-cyan" style={{ fontFamily: fonts.retro }}>
                #{index + 1} {item.player_alias}
              </Text>
              <Text className="text-[20px] text-lime" style={{ fontFamily: fonts.retro }}>
                {item.score} · L{item.level}
              </Text>
            </View>
          ))
        : null}
      <Text className="mt-3 text-[16px] text-mist/70" style={{ fontFamily: fonts.retro }}>
        {copy.ranking.hint}
      </Text>
    </View>
  );
}
