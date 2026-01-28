import { createRoute } from '@granite-js/react-native';
import ExchangeCalculator from '../src/components/ExchangeCalculator';

export const Route = createRoute('/', {
  validateParams: (params) => params,
  component: HomePage,
});

export function HomePage() {
  return <ExchangeCalculator />;
}
