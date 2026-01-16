import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='History' component={HistoryScreen} />
        <Stack.Screen name='Settings' component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
