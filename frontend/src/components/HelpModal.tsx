import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { copy } from "../copy/es";
import { fonts } from "../styles/fonts";
import { RetroButton } from "./RetroButton";

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export function HelpModal({ visible, onClose }: HelpModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/75 p-4" onPress={onClose}>
        <Pressable
          className="max-h-[90%] w-full max-w-[720px] border-2 border-cyan bg-panel p-5"
          onPress={(event) => event.stopPropagation()}
        >
          <ScrollView>
            <Text className="text-[16px] text-cyan" style={{ fontFamily: fonts.pixel }}>
              {copy.help.title}
            </Text>
            <Text className="mt-2 text-[20px] text-mist" style={{ fontFamily: fonts.retro }}>
              {copy.help.context}
            </Text>

            <Text className="mt-5 text-[14px] text-lime" style={{ fontFamily: fonts.pixel }}>
              {copy.help.objectiveTitle}
            </Text>
            <Text className="mt-2 text-[20px] text-mist" style={{ fontFamily: fonts.retro }}>
              {copy.help.objective}
            </Text>

            <Text className="mt-5 text-[14px] text-amber" style={{ fontFamily: fonts.pixel }}>
              {copy.help.controlsTitle}
            </Text>
            <View className="mt-2 border border-mist/20">
              <View className="flex-row bg-cyan/10 px-3 py-2">
                <Text className="w-[38%] text-[18px] text-cyan" style={{ fontFamily: fonts.retro }}>
                  Acción
                </Text>
                <Text className="w-[31%] text-[18px] text-cyan" style={{ fontFamily: fonts.retro }}>
                  Principal
                </Text>
                <Text className="w-[31%] text-[18px] text-cyan" style={{ fontFamily: fonts.retro }}>
                  Alternativa
                </Text>
              </View>
              {copy.controls.map((row) => (
                <View key={row.action} className="flex-row border-t border-mist/15 px-3 py-2">
                  <Text className="w-[38%] text-[18px] text-mist" style={{ fontFamily: fonts.retro }}>
                    {row.action}
                  </Text>
                  <Text className="w-[31%] text-[18px] text-lime" style={{ fontFamily: fonts.retro }}>
                    {row.primary}
                  </Text>
                  <Text className="w-[31%] text-[18px] text-magenta" style={{ fontFamily: fonts.retro }}>
                    {row.alt}
                  </Text>
                </View>
              ))}
            </View>

            <Text className="mt-5 text-[14px] text-magenta" style={{ fontFamily: fonts.pixel }}>
              {copy.help.rulesTitle}
            </Text>
            <Text className="mt-2 text-[20px] text-mist" style={{ fontFamily: fonts.retro }}>
              {copy.help.lives}
            </Text>
            <Text className="mt-2 text-[20px] text-mist" style={{ fontFamily: fonts.retro }}>
              {copy.help.extraLife}
            </Text>
            <Text className="mt-2 text-[20px] text-amber" style={{ fontFamily: fonts.retro }}>
              {copy.help.waves}
            </Text>
            <Text className="mt-3 text-[18px] text-mist/80" style={{ fontFamily: fonts.retro }}>
              {copy.help.closeHint}
            </Text>
          </ScrollView>
          <View className="mt-4">
            <RetroButton
              label={copy.actions.closeHelp}
              variant="primary"
              accessibilityLabel={copy.a11y.closeHelp}
              onPress={onClose}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
