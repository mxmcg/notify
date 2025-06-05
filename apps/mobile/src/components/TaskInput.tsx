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

export default function TaskInput(props: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Enter your first task…</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. MLB standings summary"
        placeholderTextColor="#9CA3AF"
        multiline
        testID="task-input"
        accessibilityLabel="Task"
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
