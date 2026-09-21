import { useMemo } from "react";
import { Text, TextInput, View } from "react-native";
import { copy } from "../copy/es";
import { fonts } from "../styles/fonts";
import { validateAlias } from "../utils/alias";

interface PlayerFormProps {
  alias: string;
  onChangeAlias: (value: string) => void;
}

export function PlayerForm({ alias, onChangeAlias }: PlayerFormProps) {
  const result = useMemo(() => validateAlias(alias), [alias]);
  const showError = alias.length > 0 && !result.ok;
  const showReady = result.ok;

  return (
    <View className="gap-2">
      <Text className="text-[18px] text-cyan" style={{ fontFamily: fonts.retro }}>
        {copy.alias.label}
      </Text>
      <TextInput
        value={alias}
        onChangeText={onChangeAlias}
        placeholder={copy.alias.placeholder}
        placeholderTextColor="#64748B"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={24}
        accessibilityLabel={copy.a11y.alias}
        className="min-h-[48px] border-2 border-cyan/70 bg-void px-4 py-3 text-[22px] text-mist"
        style={{ fontFamily: fonts.retro }}
      />
      <Text className="text-[18px] text-mist/80" style={{ fontFamily: fonts.retro }}>
        {copy.alias.suggestion}
      </Text>
      {showError ? (
        <Text className="text-[18px] text-amber" style={{ fontFamily: fonts.retro }}>
          {result.message}
        </Text>
      ) : null}
      {showReady ? (
        <Text className="text-[18px] text-lime" style={{ fontFamily: fonts.retro }}>
          {copy.alias.ready}
        </Text>
      ) : null}
    </View>
  );
}
