import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'exchange-calculator',
  web: {
    host: '0.0.0.0',
    port: 3008,
    commands: { dev: 'rsbuild dev', build: 'rsbuild build' },
  },
  permissions: [],
  outdir: 'dist',
  brand: {
    displayName: '나만의 환율계산기',
    icon: 'https://raw.githubusercontent.com/jino123413/app-logos/master/exchange-calculator.png',
    primaryColor: '#3182F6',
    bridgeColorMode: 'basic',
  },
  webViewProps: { type: 'partner' },
});
