import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(tabs)'); // AuthLayout directs to login
  }, []);
  return null;
}
