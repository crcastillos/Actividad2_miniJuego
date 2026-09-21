import { createElement, type RefObject } from "react";
import { Platform, Text, View } from "react-native";
import { copy } from "../copy/es";
import { PLAYFIELD } from "../game/constants";
import { fonts } from "../styles/fonts";

interface GameCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export function GameCanvas({ canvasRef }: GameCanvasProps) {
  if (Platform.OS !== "web") {
    return (
      <View className="h-[420px] items-center justify-center border-2 border-cyan/40 bg-panel p-6">
        <Text className="text-center text-[20px] text-cyan" style={{ fontFamily: fonts.retro }}>
          {copy.nativeOnly}
        </Text>
      </View>
    );
  }

  return createElement("canvas", {
    ref: canvasRef,
    width: PLAYFIELD.width,
    height: PLAYFIELD.height,
    tabIndex: 0,
    "aria-label": "Campo de juego NEON SWARM",
    style: {
      width: "100%",
      maxWidth: PLAYFIELD.width,
      aspectRatio: `${PLAYFIELD.width} / ${PLAYFIELD.height}`,
      backgroundColor: "#050510",
      border: "2px solid #22D3EE",
      display: "block",
    },
  });
}
