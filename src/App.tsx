import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  BookOpen, 
  LogOut, 
  Menu, 
  X,
  User,
  Coins,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import AviatorGame from './components/AviatorGame';
import { translations } from './data/translations';

// --- Sound Setup ---
const bgMusic = new Howl({
  src: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'],
  loop: true,
  volume: 0.3,
  html5: true
});

const clickSfx = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'],
  volume: 0.5
});

// --- Types ---
type Page = 'home' | 'deposit' | 'withdraw' | 'rules' | 'game-aviator' | 'mines' | 'chicken';
type Lang = 'en' | 'am' | 'or' | 'ti' | 'so';

export default function App() {
  const [user, setUser] = useState<{ name: string; balance: number } | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [lang, setLang] = useState<Lang>('en');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const t = translations[lang];

  // Load persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('kb_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const savedMute = localStorage.getItem('kb_mute');
    if (savedMute === 'true') {
      setIsMuted(true);
      bgMusic.mute(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('kb_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kb_user');
    }
  }, [user]);

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    bgMusic.mute(nextMute);
    localStorage.setItem('kb_mute', String(nextMute));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    clickSfx.play();
    if (!authData.username || !authData.password) return alert("Fill all fields");
    
    // Fake Auth
    setUser({ name: authData.username, balance: 100 });
    bgMusic.play();
  };

  const updateBalance = (amount: number) => {
    if (!user) return;
    setUser(prev => prev ? ({ ...prev, balance: Math.max(0, prev.balance + amount) }) : null);
  };

  const logout = () => {
    clickSfx.play();
    setUser(null);
    bgMusic.stop();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-red-500/30"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-600 rounded-full shadow-lg shadow-red-500/20">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-center text-white mb-2">Kaleab Betting</h1>
          <p className="text-gray-400 text-center mb-8">Premium Casino Experience</p>

          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-[#334155] border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-red-500"
              value={authData.username}
              onChange={e => setAuthData({...authData, username: e.target.value})}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#334155] border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-red-500"
              value={authData.password}
              onChange={e => setAuthData({...authData, password: e.target.value})}
            />
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all transform active:scale-95">
              {isLogin ? t.login : t.register}
            </button>
          </form>

          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-4 text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>

          <div className="mt-6 flex justify-center gap-2">
            {(['en', 'am', 'or', 'ti', 'so'] as Lang[]).map(l => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 text-xs rounded ${lang === l ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#1e293b]/80 backdrop-blur-md border-b border-gray-700 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-700 rounded-lg lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-500" />
            <span className="font-bold text-lg hidden sm:inline">Kaleab Betting</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#334155] px-4 py-1.5 rounded-full flex items-center gap-2 border border-yellow-500/30">
            <span className="text-yellow-500 font-bold">{user.balance.toFixed(2)}</span>
            <span className="text-xs text-gray-400 uppercase">ETB</span>
          </div>
          <button onClick={toggleMute} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
             {isMuted ? <span className="text-red-500">🔇</span> : <span>🔊</span>}
          </button>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full hidden md:flex">
             <User className="w-4 h-4 text-gray-400" />
             <span className="text-sm font-medium">{user.name}</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60]"
            />
            <motion.nav 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-[#1e293b] z-[70] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-xl text-red-500">Menu</span>
                <button onClick={() => setSidebarOpen(false)}><X /></button>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'home', icon: Home, label: t.games },
                  { id: 'deposit', icon: ArrowDownCircle, label: t.deposit },
                  { id: 'withdraw', icon: ArrowUpCircle, label: t.withdraw },
                  { id: 'rules', icon: BookOpen, label: t.rules },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentPage(item.id as Page); setSidebarOpen(false); clickSfx.play(); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${currentPage === item.id ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                 <div className="mb-4 flex flex-wrap gap-2">
                    {['en', 'am', 'or', 'ti', 'so'].map(l => (
                      <button key={l} onClick={() => setLang(l as Lang)} className={`text-[10px] px-2 py-1 rounded ${lang === l ? 'bg-red-500' : 'bg-gray-800'}`}>
                        {l.toUpperCase()}
                      </button>
                    ))}
                 </div>
                 <button onClick={logout} className="w-full flex items-center gap-4 p-4 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                    <LogOut className="w-6 h-6" />
                    <span className="font-medium">{t.logout}</span>
                 </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {currentPage === 'home' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             <GameCard 
                title={t.aviator} 
                image="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=400" 
                color="bg-red-600"
                onClick={() => setCurrentPage('game-aviator')}
             />
             <GameCard 
                title={t.mines} 
                image="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400" 
                color="bg-blue-600"
                onClick={() => alert("Coming soon")}
             />
             <GameCard 
                title={t.roulette} 
                image="https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400" 
                color="bg-yellow-600"
                onClick={() => alert("Coming soon")}
             />
             <GameCard 
                title={t.football} 
                image="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400" 
                color="bg-green-600"
                onClick={() => alert("Coming soon")}
             />
             <GameCard 
                title={t.luckyJet} 
                image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400" 
                color="bg-purple-600"
                onClick={() => alert("Coming soon")}
             />
             <GameCard 
                title={t.chickenRoad} 
                image="https://images.unsplash.com/photo-1582456780653-a6208929e73d?auto=format&fit=crop&q=80&w=400" 
                color="bg-orange-600"
                onClick={() => alert("Coming soon")}
             />
          </div>
        )}

        {currentPage === 'game-aviator' && (
           <div>
              <button onClick={() => setCurrentPage('home')} className="mb-4 text-red-500 flex items-center gap-2 hover:underline">
                ← Back to Home
              </button>
              <AviatorGame balance={user.balance} onUpdateBalance={updateBalance} translations={t} />
           </div>
        )}

        {currentPage === 'deposit' && (
          <div className="max-w-2xl mx-auto bg-[#1e293b] p-8 rounded-2xl border border-yellow-500/20">
            <h2 className="text-3xl font-bold text-yellow-500 mb-6">{t.depositTitle}</h2>
            <p className="text-gray-400 mb-8">{t.depositDesc}</p>
            
            <div className="space-y-6">
              <div className="bg-[#334155] p-6 rounded-xl border-l-4 border-yellow-500">
                <p className="text-sm text-gray-400 mb-1">Commercial Bank of Ethiopia (CBE)</p>
                <p className="text-2xl font-mono font-bold text-white">1000609294028</p>
                <p className="text-lg text-yellow-500">Kaleab Abebe</p>
              </div>

              <div className="bg-[#334155] p-6 rounded-xl border-l-4 border-red-500">
                <p className="text-sm text-gray-400 mb-1">TeleBirr</p>
                <p className="text-2xl font-mono font-bold text-white">0949124743</p>
                <p className="text-lg text-red-500">Kaleab Abebe</p>
              </div>

              <div className="bg-blue-600/10 p-6 rounded-xl border border-blue-500/30 flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-400">Telegram Verification</p>
                  <p className="text-sm text-gray-400">Send proof to: @uuummppaa</p>
                </div>
                <a href="https://t.me/uuummppaa" target="_blank" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Contact</a>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'withdraw' && (
          <div className="max-w-2xl mx-auto bg-[#1e293b] p-8 rounded-2xl border border-red-500/20">
            <h2 className="text-3xl font-bold text-red-500 mb-6">{t.withdraw}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.selectMethod}</label>
                <select className="w-full bg-[#334155] border-none rounded-lg p-4 text-white">
                  <option>TeleBirr</option>
                  <option>CBE Bank</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t.enterAmount}</label>
                <input type="number" placeholder="20.00" className="w-full bg-[#334155] border-none rounded-lg p-4 text-white" />
                <p className="text-xs text-gray-500 mt-2">{t.minWithdraw}</p>
              </div>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg mt-4 shadow-lg shadow-red-500/20">
                {t.withdraw}
              </button>
            </div>
          </div>
        )}

        {currentPage === 'rules' && (
          <div className="max-w-4xl mx-auto prose prose-invert">
            <h1 className="text-4xl font-bold text-red-500 mb-6">{t.rules}</h1>
            <div className="bg-[#1e293b] p-8 rounded-2xl border border-gray-700 space-y-6">
              <section>
                <h3 className="text-xl font-bold text-white mb-2">1. Aviator</h3>
                <p className="text-gray-400">Place a bet and watch the multiplier grow. Cash out before the plane flies away. If the plane flies away before you cash out, you lose your bet.</p>
              </section>
              <section>
                <h3 className="text-xl font-bold text-white mb-2">2. Withdrawals</h3>
                <p className="text-gray-400">Minimum withdrawal is 20 ETB. Processing takes up to 24 hours. Verification via Telegram may be required for large amounts.</p>
              </section>
              <section>
                <h3 className="text-xl font-bold text-white mb-2">3. Responsible Gaming</h3>
                <p className="text-gray-400">Please play responsibly. Betting is for entertainment purposes. Only bet what you can afford to lose.</p>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Desktop Quick Nav Overlay (Bottom) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1e293b]/90 backdrop-blur-md px-6 py-3 rounded-full border border-gray-700 shadow-2xl hidden lg:flex items-center gap-8">
          <NavIcon icon={Home} label={t.games} active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
          <NavIcon icon={ArrowDownCircle} label={t.deposit} active={currentPage === 'deposit'} onClick={() => setCurrentPage('deposit')} />
          <NavIcon icon={ArrowUpCircle} label={t.withdraw} active={currentPage === 'withdraw'} onClick={() => setCurrentPage('withdraw')} />
          <NavIcon icon={BookOpen} label={t.rules} active={currentPage === 'rules'} onClick={() => setCurrentPage('rules')} />
      </div>
    </div>
  );
}

function NavIcon({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={() => { clickSfx.play(); onClick(); }} className={`flex flex-col items-center gap-1 group transition-all ${active ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
      <Icon className={`w-6 h-6 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function GameCard({ title, image, color, onClick }: { title: string, image: string, color: string, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => { clickSfx.play(); onClick(); }}
      className="relative overflow-hidden rounded-2xl group cursor-pointer aspect-[4/5] shadow-xl"
    >
      <img src={image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={title} />
      <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80`} />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className={`w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-2 ${color}`}>Featured</div>
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-gray-300">Play Now →</p>
      </div>
    </motion.div>
  );
}