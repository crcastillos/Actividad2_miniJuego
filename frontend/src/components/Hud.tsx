import { Text, View } from "react-native";
import { copy } from "../copy/es";
import { fonts } from "../styles/fonts";
import type { HudView } from "../types/game.types";

interface HudProps {
  view: HudView;
}

export function Hud({ view }: HudProps) {
  return (
    <View className="w-full flex-row flex-wrap items-center justify-between gap-3 border-2 border-cyan/40 bg-panel px-4 py-3">
      <HudStat label={copy.hud.alias} value={view.alias} color="text-cyan" />
      <HudStat label={copy.hud.wave} value={String(view.wave)} color="text-amber" />
      <HudStat label={copy.hud.score} value={String(view.score).padStart(6, "0")} color="text-lime" />
      <View className="min-w-[140px]">
        <Text className="text-[16px] text-mist/70" style={{ fontFamily: fonts.retro }}>
          {copy.hud.lives}
        </Text>
        <View className="mt-1 flex-row items-center gap-1">
          {Array.from({ length: Math.max(view.lives, 0) }).map((_, index) => (
            <View key={`life-${index}`} className="h-3 w-3 rotate-45 bg-cyan" />
          ))}
          <Text className="ml-2 text-[20px] text-cyan" style={{ fontFamily: fonts.retro }}>
            x{view.lives}
          </Text>
        </View>
      </View>
    </View>
  );
}

function HudStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View className="min-w-[120px]">
      <Text className="text-[16px] text-mist/70" style={{ fontFamily: fonts.retro }}>
        {label}
      </Text>
      <Text className={`text-[22px] ${color}`} style={{ fontFamily: fonts.retro }}>
        {value}
      </Text>
    </View>
  );
}
