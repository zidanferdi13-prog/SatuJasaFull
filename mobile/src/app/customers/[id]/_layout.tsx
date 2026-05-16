import { Stack } from 'expo-router';

export default function CustomerDetailLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: true, title: 'Detail Pelanggan' }} />
      <Stack.Screen name="edit" options={{ headerShown: true, title: 'Edit Pelanggan' }} />
    </Stack>
  );
}
