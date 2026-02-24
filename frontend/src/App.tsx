
import { useState } from 'react';
import { Header } from './components/Header/Header';
import { BondForm } from './components/BondForm/BondForm';
import { BondResultType } from './components/BondResult/BondResult';
import { CashFlowEntry } from './components/CashFlowTable/CashFlowTable';
import { BondResultPanel } from './components/BondResultPanel/BondResultPanel';
import { GenesisBackground } from './components/GenesisBackground/GenesisBackground';
import './App.scss';

function App() {
  const [result, setResult] = useState<(BondResultType & { cashFlowSchedule: CashFlowEntry[] }) | null>(null);


  return (
    <GenesisBackground>
      <div>
        <Header />
        <main className="main-centered">
          {
            !result ? (
              <BondForm onSuccess={setResult} />
            ) : (
              <BondResultPanel
                result={result}
                onRequestAgain={() => { setResult(null) }}
              />
            )
          }
        </main>
      </div>
    </GenesisBackground>
  );
}

export default App;
