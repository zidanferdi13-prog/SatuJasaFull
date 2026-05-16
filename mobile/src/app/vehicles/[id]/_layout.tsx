import { Stack } from 'expo-router';

export default function VehicleDetailLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: true, title: 'Detail Kendaraan' }} />
      <Stack.Screen name="edit" options={{ headerShown: true, title: 'Edit Kendaraan' }} />
    </Stack>
  );
}
