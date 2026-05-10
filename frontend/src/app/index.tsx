import { AppProvider } from './provider';
import { AppRouter } from './router';
import { defaultServices } from '@/services/bootstrap/services';

export function App() {
  return (
    <AppProvider services={defaultServices}>
      <AppRouter />
    </AppProvider>
  );
}
