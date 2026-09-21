import { Text, View } from "react-native";
import { fonts } from "../styles/fonts";

export type ToastTone = "success" | "info" | "error";

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

const toneClass: Record<ToastTone, string> = {
  success: "border-lime text-lime",
  info: "border-cyan text-cyan",
  error: "border-amber text-amber",
};

export function ToastHost({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <View
      accessible={false}
      accessibilityLiveRegion="polite"
      pointerEvents="none"
      className="absolute bottom-4 right-4 z-50 w-[320px] max-w-[90%] gap-2"
    >
      {toasts.map((toast) => (
        <View
          key={toast.id}
          accessible={false}
          pointerEvents="none"
          className={`border-2 bg-panel/95 px-4 py-3 ${toneClass[toast.tone]}`}
        >
          <Text
            accessible={false}
            className={`text-[18px] ${toneClass[toast.tone]}`}
            style={{ fontFamily: fonts.retro }}
          >
            {toast.message}
          </Text>
        </View>
      ))}
    </View>
  );
}
