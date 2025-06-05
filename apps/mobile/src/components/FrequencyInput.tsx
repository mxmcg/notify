import { GRAY, WHITE } from "@theme/colors";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface Props extends TextInputProps {}

export default function FrequencyInput(props: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        How often do you want to be pinged about this?
      </Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Every day at 8 AM"
        placeholderTextColor="#9CA3AF"
        testID="frequency-input"
        accessibilityLabel="Frequency"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 32 },
  label: { fontSize: 14, color: GRAY, marginBottom: 8 },
  input: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 56,
  },
});
