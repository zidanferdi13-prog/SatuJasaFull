import { TransactionForm } from '../shared/components/TransactionForm';
import { useRouter } from 'expo-router';

export default function TransactionScreen() {
  const router = useRouter();

  return (
    <TransactionForm
      onSuccess={() => router.replace('/home')}
      onCancel={() => router.back()}
    />
  );
}
