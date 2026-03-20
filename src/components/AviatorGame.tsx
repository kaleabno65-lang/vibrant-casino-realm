import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

interface AviatorProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  translations: any;
}

const AviatorGame: React.FC<AviatorProps> = ({ balance, onUpdateBalance, translations }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<'idle' | 'flying' | 'crashed'>('idle');
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 600,
      height: 300,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
      },
      scene: {
        create: function (this: Phaser.Scene) {
          this.add.grid(300, 150, 600, 300, 40, 40, 0x242444, 0.5);
          const graphics = this.add.graphics();
          this.data.set('graphics', graphics);
          this.data.set('multiplier', 1.0);
          this.data.set('isFlying', false);

          const plane = this.add.circle(40, 260, 10, 0xff0000);
          this.data.set('plane', plane);
        },
        update: function (this: Phaser.Scene) {
          const isFlying = this.data.get('isFlying');
          if (isFlying) {
            const mult = this.data.get('multiplier');
            const graphics = this.data.get('graphics') as Phaser.GameObjects.Graphics;
            const plane = this.data.get('plane') as Phaser.GameObjects.Arcade.Sprite;

            graphics.clear();
            graphics.lineStyle(4, 0xff0000, 1);
            graphics.beginPath();
            graphics.moveTo(40, 260);

            // Draw a exponential curve
            for (let i = 0; i <= mult * 20; i++) {
              const x = 40 + i * 5;
              const y = 260 - Math.pow(i/10, 2) * 10;
              if (x > 600 || y < 0) break;
              graphics.lineTo(x, y);
              plane.setPosition(x, y);
            }
            graphics.strokePath();
          }
        }
      }
    };

    const game = new Phaser.Game(config);
    phaserGameRef.current = game;

    return () => {
      game.destroy(true);
    };
  }, []);

  const startGame = () => {
    if (balance < betAmount) return alert("Insufficient Balance");
    onUpdateBalance(-betAmount);
    setIsPlaying(true);
    setGameState('flying');
    setCurrentMultiplier(1.0);

    const scene = phaserGameRef.current?.scene.getAt(0);
    if (scene) {
      scene.data.set('isFlying', true);
      scene.data.set('multiplier', 1.0);
    }

    const crashAt = 1 + Math.random() * 5;
    const interval = setInterval(() => {
      setCurrentMultiplier(prev => {
        const next = prev + 0.01;
        if (scene) scene.data.set('multiplier', next);
        if (next >= crashAt) {
          clearInterval(interval);
          handleCrash();
          return next;
        }
        return next;
      });
    }, 50);

    (window as any).aviatorInterval = interval;
  };

  const handleCrash = () => {
    setIsPlaying(false);
    setGameState('crashed');
    const scene = phaserGameRef.current?.scene.getAt(0);
    if (scene) scene.data.set('isFlying', false);
  };

  const cashOut = () => {
    if (gameState !== 'flying') return;
    clearInterval((window as any).aviatorInterval);
    const win = betAmount * currentMultiplier;
    onUpdateBalance(win);
    setIsPlaying(false);
    setGameState('idle');
    const scene = phaserGameRef.current?.scene.getAt(0);
    if (scene) scene.data.set('isFlying', false);
    alert(`${translations.win} ${win.toFixed(2)} ETB`);
  };

  return (
    <div className="flex flex-col items-center bg-gray-900 p-4 rounded-xl shadow-2xl border-2 border-red-500 max-w-2xl mx-auto mt-4">
      <h2 className="text-2xl font-bold text-red-500 mb-2">{translations.aviator}</h2>
      <div ref={gameRef} className="rounded-lg overflow-hidden border-2 border-gray-700" />
      
      <div className="flex flex-col items-center mt-4 w-full gap-4">
        <div className="text-4xl font-black text-red-500">
          {currentMultiplier.toFixed(2)}x
        </div>

        <div className="flex gap-4 w-full">
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="flex-1 bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={isPlaying}
          />
          {isPlaying ? (
            <button
              onClick={cashOut}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-all transform active:scale-95"
            >
              {translations.cashOut} ({(betAmount * currentMultiplier).toFixed(2)})
            </button>
          ) : (
            <button
              onClick={startGame}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform active:scale-95"
            >
              {translations.bet}
            </button>
          )}
        </div>
      </div>
      {gameState === 'crashed' && (
        <p className="text-red-500 font-bold mt-2 animate-bounce">{translations.crash}</p>
      )}
    </div>
  );
};

export default AviatorGame;