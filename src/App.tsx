import React from 'react';
import { DeviceViewport } from './components/DeviceViewport';
import ExchangeCalculator from './components/ExchangeCalculator';

const App: React.FC = () => (
  <>
    <DeviceViewport />
    <div className="min-h-screen font-gmarket bg-[#F5F5F5]">
      <ExchangeCalculator />
    </div>
  </>
);
export default App;
