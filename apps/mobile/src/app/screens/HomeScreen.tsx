// screens/HomeScreen.tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import InterruptButton from '../../features/interrupt/components/InterruptButton';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <InterruptButton onPress={() => console.log('Interrupted!')} />
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