import { Pressable, Text, type PressableProps } from "react-native";
import { play } from "../audio/sfx";
import { fonts } from "../styles/fonts";

type Variant = "primary" | "magenta" | "amber" | "ghost";

interface RetroButtonProps extends PressableProps {
  label: string;
  variant?: Variant;
  accessibilityLabel?: string;
}

const variantClass: Record<Variant, string> = {
  primary: "border-cyan bg-cyan/10",
  magenta: "border-magenta bg-magenta/10",
  amber: "border-amber bg-amber/10",
  ghost: "border-mist/40 bg-transparent",
};

const variantText: Record<Variant, string> = {
  primary: "text-cyan",
  magenta: "text-magenta",
  amber: "text-amber",
  ghost: "text-mist",
};

export function RetroButton({
  label,
  variant = "primary",
  disabled,
  accessibilityLabel,
  onPress,
  ...rest
}: RetroButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      className={`min-h-[48px] items-center justify-center border-2 px-5 py-3 ${variantClass[variant]} ${
        disabled ? "opacity-40" : "active:opacity-80"
      }`}
      onPress={(event) => {
        if (!disabled) {
          play("uiClick");
        }
        onPress?.(event);
      }}
      {...rest}
    >
      <Text
        className={`text-center text-[20px] tracking-wide ${variantText[variant]}`}
        style={{ fontFamily: fonts.retro }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
