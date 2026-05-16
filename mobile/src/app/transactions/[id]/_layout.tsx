import { Stack } from 'expo-router';

export default function TransactionDetailLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: true, title: 'Detail Transaksi' }} />
      <Stack.Screen name="status" options={{ headerShown: true, title: 'Update Status' }} />
      <Stack.Screen name="finalize" options={{ headerShown: true, title: 'Finalisasi' }} />
      <Stack.Screen name="close" options={{ headerShown: true, title: 'Tutup Transaksi' }} />
    </Stack>
  );
}
