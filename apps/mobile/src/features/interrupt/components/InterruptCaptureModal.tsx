import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export type InterruptCaptureModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export function InterruptCaptureModal(props: InterruptCaptureModalProps) {
  const { visible, onCancel, onSave } = props;

  const handleCancel = () => {
    onCancel();
  }

  const handleSave = () => {
    onSave();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      presentationStyle="fullScreen"
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleCancel} hitSlop={12}>
              <Text style={styles.headerClose}>×</Text>
            </Pressable>
            <Text style={styles.headerTitle}>中断</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleSave}
              style={[styles.footerButton, styles.footerPrimary]}
            >
              <Text style={styles.footerPrimaryText}>休憩する</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6fbff" },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerClose: { fontSize: 28 },
  headerTitle: { fontSize: 16, fontWeight: "600" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  sectionTitle: { marginTop: 18, marginBottom: 8, fontSize: 15, fontWeight: "600" },
  caption: { marginTop: 10, marginBottom: 6, fontSize: 13, opacity: 0.7 },
  row: { flexDirection: "row", gap: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  smallButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  smallButtonText: { fontWeight: "600" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 13 },
  stepperButton: {
    borderWidth: 1,
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: { fontSize: 20, fontWeight: "700" },
  minutesBox: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    width: 90,
  },
  minutesValue: { fontSize: 28, fontWeight: "700" },
  minutesLabel: { marginLeft: 6, fontSize: 14, opacity: 0.7 },
  quickRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  quickButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  quickButtonText: { fontWeight: "600" },
  footer: {
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  footerSecondary: { borderWidth: 1 },
  footerSecondaryText: { fontWeight: "600" },
  footerPrimary: { borderWidth: 1 },
  footerPrimaryText: { fontWeight: "700" },
});
