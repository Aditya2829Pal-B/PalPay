/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameMode, GameSettings } from './types';
import SetupScreen from './components/SetupScreen';
import ClassicGame from './components/ClassicGame';
import LiveGame from './components/LiveGame';
import P2PTransferScreen from './components/P2PTransferScreen';

export default function App() {
  const [mode, setMode] = useState<GameMode>('setup');
  const [settings, setSettings] = useState<GameSettings | null>(null);

  const handleStart = (selectedMode: GameMode, selectedSettings: GameSettings | null = null) => {
    if (selectedSettings) setSettings(selectedSettings);
    setMode(selectedMode);
  };

  const handleExit = () => {
    setMode('setup');
    setSettings(null);
  };

  if (mode === 'setup') {
    return <SetupScreen onStart={handleStart} />;
  }

  if (mode === 'classic' && settings) {
    return <ClassicGame settings={settings} onExit={handleExit} />;
  }

  if (mode === 'live' && settings) {
    return <LiveGame settings={settings} onExit={handleExit} />;
  }

  if (mode === 'p2p_transfer') {
    return <P2PTransferScreen onExit={handleExit} />;
  }

  return null;
}

