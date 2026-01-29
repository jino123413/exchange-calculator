import { appsInToss } from '@apps-in-toss/framework/plugins';
import { router } from '@granite-js/plugin-router';
import { hermes } from '@granite-js/plugin-hermes';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'exchange-calculator',
  plugins: [
    appsInToss({
      brand: {
        displayName: '환율 계산기',
        primaryColor: '#3182F6',
        icon: 'https://static.toss.im/appsintoss/16681/74c03381-5c2d-423e-986f-28255a69f9c6.png',
        bridgeColorMode: 'basic',
      },
      permissions: [],
    }),
    router(),
    hermes(),
  ],
});
