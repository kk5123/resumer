// screens/HomeScreen.tsx
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import InterruptButton from '../../features/interrupt/components/InterruptButton';
import { InterruptCaptureModal } from '../../features/interrupt/components/InterruptCaptureModal';

export default function HomeScreen() {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <InterruptButton onPress={() => setVisible((v) => !v)} />
      <InterruptCaptureModal
        visible={visible}
        onCancel={() => {setVisible(false)}}
        onSave={() => {setVisible(false)}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});