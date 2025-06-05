import { GRAY, WHITE } from "@theme/colors";
import React from "react";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

interface Props extends Omit<PressableProps, "style"> {
  label: string;
  disabled?: boolean;
}

export default function PrimaryButton({ label, disabled, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button, 
        pressed && !disabled && { opacity: 0.85 },
        disabled && styles.disabled
      ]}
      disabled={disabled}
      {...rest}
    >
      <Text style={[styles.text, disabled && styles.disabledText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    marginBottom: 32,
    backgroundColor: WHITE,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  disabled: {
    backgroundColor: '#f0f0f0',
    shadowOpacity: 0.05,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: GRAY,
  },
  disabledText: {
    color: '#999',
  },
});
