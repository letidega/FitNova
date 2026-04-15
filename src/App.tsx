import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Dumbbell, 
  Apple, 
  User, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Flame, 
  Footprints, 
  Droplets,
  ChevronRight,
  Plus,
  Search,
  Bell,
  MessageSquare,
  Send,
  Zap,
  Award,
  Sun,
  Moon,
  Settings as SettingsIcon
} from 'lucide-react';
import { geminiService } from './services/gemini';

type Tab = 'dashboard' | 'workouts' | 'nutrition' | 'coach' | 'profile';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await geminiService.generateChatResponse(input, history);
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response || 'Lo siento, no pude procesar eso.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--fg)] fitness-grid overflow-hidden transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 border-r border-[var(--border)] bg-[var(--bg)] flex-col z-20 transition-colors duration-300">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <Activity size={24} className="text-white" />
          </div>
          <h1 className="font-bold text-2xl tracking-tight">FitNova</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <SidebarItem 
            icon={<TrendingUp size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<Dumbbell size={20} />} 
            label="Entrenamientos" 
            active={activeTab === 'workouts'} 
            onClick={() => setActiveTab('workouts')} 
          />
          <SidebarItem 
            icon={<Apple size={20} />} 
            label="Nutrición" 
            active={activeTab === 'nutrition'} 
            onClick={() => setActiveTab('nutrition')} 
          />
          <SidebarItem 
            icon={<MessageSquare size={20} />} 
            label="Coach AI" 
            active={activeTab === 'coach'} 
            onClick={() => setActiveTab('coach')} 
          />
          <SidebarItem 
            icon={<User size={20} />} 
            label="Perfil" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
        </nav>

        <div className="p-6 border-t border-[var(--border)]">
          <div className="bg-[var(--muted)] p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[var(--accent)] font-bold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Juan Delgado</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">Plan Premium</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md flex items-center justify-between px-8 z-10 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-[var(--muted)] rounded-full transition-colors"
              title={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            <div className="hidden sm:flex items-center bg-[var(--muted)] px-4 py-2 rounded-full gap-2 transition-colors">
              <Search size={16} className="text-[var(--muted-foreground)]" />
              <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm w-32" />
            </div>
            <button 
              onClick={() => setNotification("No hay notificaciones nuevas.")}
              className="p-2 hover:bg-[var(--muted)] rounded-full relative transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg)]/50 transition-colors duration-300">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-200 relative overflow-hidden">
                  <div className="relative z-10 space-y-2">
                    <h3 className="text-3xl font-bold">¡Hola, Juan! 👋</h3>
                    <p className="opacity-90 max-w-md">Has completado el 85% de tus objetivos semanales. ¡Sigue así, estás muy cerca!</p>
                    <button 
                      onClick={() => setNotification("Cargando resumen semanal...")}
                      className="mt-4 bg-white text-orange-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-orange-50 transition-colors"
                    >
                      Ver Resumen Semanal
                    </button>
                  </div>
                  <Activity size={120} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    icon={<Footprints className="text-blue-500" />} 
                    label="Pasos" 
                    value="8,432" 
                    unit="pasos" 
                    progress={84} 
                    color="bg-blue-500"
                  />
                  <StatCard 
                    icon={<Flame className="text-orange-500" />} 
                    label="Calorías" 
                    value="1,240" 
                    unit="kcal" 
                    progress={62} 
                    color="bg-orange-500"
                  />
                  <StatCard 
                    icon={<Droplets className="text-cyan-500" />} 
                    label="Agua" 
                    value="1.8" 
                    unit="litros" 
                    progress={72} 
                    color="bg-cyan-500"
                  />
                  <StatCard 
                    icon={<Clock className="text-purple-500" />} 
                    label="Sueño" 
                    value="7h 20m" 
                    unit="dormido" 
                    progress={91} 
                    color="bg-purple-500"
                  />
                </div>

                {/* Secondary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Activity Chart Placeholder */}
                  <div className="lg:col-span-2 glass-panel p-8 space-y-6 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg">Actividad Semanal</h4>
                      <select className="bg-[var(--muted)] text-xs font-bold px-3 py-1 rounded-lg outline-none transition-colors">
                        <option>Esta Semana</option>
                        <option>Semana Pasada</option>
                      </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            className={`w-full max-w-[40px] rounded-t-xl ${i === 3 ? 'bg-orange-500' : 'bg-orange-200'}`}
                          />
                          <span className="text-[10px] font-bold text-[var(--muted-foreground)]">
                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Workouts */}
                  <div className="glass-panel p-8 space-y-6 transition-colors duration-300">
                    <h4 className="font-bold text-lg">Próximos Retos</h4>
                    <div className="space-y-4">
                      <ChallengeItem 
                        icon={<Award className="text-yellow-500" />} 
                        title="Maratón 10K" 
                        date="En 3 días" 
                      />
                      <ChallengeItem 
                        icon={<Zap className="text-blue-500" />} 
                        title="HIIT Intenso" 
                        date="Mañana, 08:00" 
                      />
                      <ChallengeItem 
                        icon={<Dumbbell className="text-purple-500" />} 
                        title="Fuerza Core" 
                        date="Hoy, 18:30" 
                      />
                    </div>
                    <button 
                      onClick={() => setNotification("Abriendo calendario de entrenamientos...")}
                      className="w-full py-3 border-2 border-[var(--border)] rounded-2xl text-sm font-bold hover:bg-[var(--muted)] transition-colors"
                    >
                      Ver Calendario
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'coach' && (
              <motion.div 
                key="coach"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto h-full flex flex-col"
              >
                <div className="flex-1 space-y-6 mb-8">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                        <MessageSquare size={40} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold">Tu Coach FitNova AI</h3>
                        <p className="max-w-xs mx-auto text-sm">Pregúntame sobre rutinas, nutrición o cómo mejorar tu rendimiento.</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        <SuggestionChip text="¿Plan de 5km?" onClick={() => setInput("¿Cómo puedo empezar a entrenar para una carrera de 5km?")} />
                        <SuggestionChip text="¿Cena saludable?" onClick={() => setInput("Dame 3 ideas de cenas saludables ricas en proteína.")} />
                        <SuggestionChip text="¿Rutina de core?" onClick={() => setInput("¿Cuál es la mejor rutina de core para principiantes?")} />
                      </div>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-orange-500 text-white font-medium' 
                          : 'bg-white border border-[var(--border)] text-[var(--fg)]'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <span className="text-[10px] opacity-50 mt-3 block font-bold uppercase tracking-widest">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-[var(--border)] p-4 rounded-2xl flex gap-1 shadow-sm">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="sticky bottom-0 pb-4">
                  <div className="bg-[var(--bg)] border border-[var(--border)] p-3 rounded-3xl shadow-xl flex items-center gap-3 transition-colors duration-300">
                    <button 
                      onClick={() => setNotification("Función de adjuntar archivos próximamente.")}
                      className="p-2 hover:bg-[var(--muted)] rounded-full text-[var(--muted-foreground)] transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-sm"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="p-3 bg-orange-500 text-white rounded-2xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-orange-200"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'workouts' && (
              <motion.div 
                key="workouts"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Tus Rutinas</h3>
                  <button 
                    onClick={() => setNotification("Iniciando creador de rutinas...")}
                    className="bg-orange-500 text-white px-6 py-2 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-200"
                  >
                    <Plus size={18} /> Nueva Rutina
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <WorkoutCard 
                    title="Fuerza de Cuerpo Completo" 
                    duration="45 min" 
                    level="Intermedio" 
                    image="https://picsum.photos/seed/workout1/800/600"
                    tags={['Pesos', 'Fuerza']}
                  />
                  <WorkoutCard 
                    title="Yoga Flow Matutino" 
                    duration="30 min" 
                    level="Principiante" 
                    image="https://picsum.photos/seed/workout2/800/600"
                    tags={['Flexibilidad', 'Zen']}
                  />
                  <WorkoutCard 
                    title="HIIT Explosivo" 
                    duration="20 min" 
                    level="Avanzado" 
                    image="https://picsum.photos/seed/workout3/800/600"
                    tags={['Cardio', 'Intenso']}
                  />
                </div>
              </motion.div>
            )}
            
            {activeTab === 'nutrition' && (
              <motion.div 
                key="nutrition"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Registro de Comidas</h3>
                  <button 
                    onClick={() => setNotification("Abriendo diario de nutrición...")}
                    className="bg-orange-500 text-white px-6 py-2 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-200"
                  >
                    <Plus size={18} /> Añadir Comida
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <MealItem time="08:00" title="Desayuno Proteico" calories={450} carbs={40} protein={35} fat={15} />
                    <MealItem time="13:30" title="Ensalada de Pollo y Quinoa" calories={620} carbs={55} protein={45} fat={20} />
                    <MealItem time="17:00" title="Snack: Almendras y Fruta" calories={210} carbs={20} protein={5} fat={12} />
                  </div>
                  <div className="glass-panel p-6 space-y-6 h-fit">
                    <h4 className="font-bold">Resumen Diario</h4>
                    <div className="space-y-4">
                      <NutrientProgress label="Proteína" current={85} target={150} color="bg-blue-500" />
                      <NutrientProgress label="Carbohidratos" current={115} target={200} color="bg-green-500" />
                      <NutrientProgress label="Grasas" current={47} target={65} color="bg-yellow-500" />
                    </div>
                    <div className="pt-4 border-t border-[var(--border)]">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-bold opacity-50">Total Calorías</span>
                        <span className="text-xl font-bold text-orange-500">1,280 / 2,200</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="max-w-2xl mx-auto space-y-8"
              >
                <div className="glass-panel p-8 text-center space-y-6">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-4xl font-bold border-4 border-white shadow-lg">
                      JD
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full shadow-lg">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Juan Delgado</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">Miembro desde Enero 2026</p>
                  </div>
                  <div className="flex justify-center gap-8 py-4 border-y border-[var(--border)]">
                    <div className="text-center">
                      <p className="text-xl font-bold">78 kg</p>
                      <p className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">Peso Actual</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">182 cm</p>
                      <p className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">Altura</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">14%</p>
                      <p className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">Grasa Corp.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <ProfileLink icon={<Award />} label="Mis Logros" count="12" onClick={() => setNotification("Cargando tus medallas...")} />
                  <ProfileLink icon={<Calendar />} label="Historial de Actividad" onClick={() => setNotification("Cargando historial...")} />
                  <ProfileLink icon={<SettingsIcon />} label="Ajustes de Cuenta" onClick={() => setNotification("Abriendo ajustes...")} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-slate-700"
            >
              <Zap size={18} className="text-orange-400" />
              <span className="text-sm font-bold">{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg)] border-t border-[var(--border)] flex justify-around p-4 z-30 transition-colors duration-300">
        <MobileNavItem icon={<TrendingUp size={24} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<Dumbbell size={24} />} active={activeTab === 'workouts'} onClick={() => setActiveTab('workouts')} />
        <MobileNavItem icon={<MessageSquare size={24} />} active={activeTab === 'coach'} onClick={() => setActiveTab('coach')} />
        <MobileNavItem icon={<User size={24} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 group ${
        active 
          ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 font-bold' 
          : 'text-[var(--muted-foreground)] hover:text-[var(--fg)] hover:bg-[var(--muted)]'
      }`}
    >
      <span className={`${active ? 'text-orange-600' : 'text-[var(--muted-foreground)] group-hover:text-orange-600'} transition-colors`}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 bg-orange-600 rounded-full" />}
    </button>
  );
}

function MobileNavItem({ icon, active, onClick }: { icon: React.ReactNode, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 transition-colors ${active ? 'text-orange-600' : 'text-[var(--muted-foreground)]'}`}
    >
      {icon}
    </button>
  );
}

function StatCard({ icon, label, value, unit, progress, color }: { icon: React.ReactNode, label: string, value: string, unit: string, progress: number, color: string }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-[var(--muted)] rounded-xl transition-colors">
          {icon}
        </div>
        <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest">{label}</span>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-xs text-[var(--muted-foreground)]">{unit}</span>
        </div>
        <div className="mt-4 h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden transition-colors">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full ${color}`}
          />
        </div>
      </div>
    </div>
  );
}

function ChallengeItem({ icon, title, date }: { icon: React.ReactNode, title: string, date: string }) {
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-[var(--muted)] rounded-2xl transition-colors cursor-pointer group">
      <div className="p-2 bg-[var(--card)] rounded-xl shadow-sm group-hover:shadow-md transition-all">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-bold tracking-widest">{date}</p>
      </div>
      <ChevronRight size={16} className="text-[var(--muted-foreground)]" />
    </div>
  );
}

function WorkoutCard({ title, duration, level, image, tags }: { title: string, duration: string, level: string, image: string, tags: string[] }) {
  return (
    <div className="glass-panel overflow-hidden group cursor-pointer hover:border-orange-500 transition-colors">
      <div className="h-48 overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
        <div className="absolute top-4 left-4 flex gap-2">
          {tags.map(tag => (
            <span key={tag} className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="p-6 space-y-4">
        <h4 className="font-bold text-lg leading-tight">{title}</h4>
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1">
            <Clock size={14} /> {duration}
          </div>
          <div className="flex items-center gap-1">
            <Activity size={14} /> {level}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionChip({ text, onClick }: { text: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-full text-xs font-bold text-[var(--fg)] hover:border-orange-500 hover:text-orange-500 transition-all shadow-sm"
    >
      {text}
    </button>
  );
}

function MealItem({ time, title, calories, carbs, protein, fat }: { time: string, title: string, calories: number, carbs: number, protein: number, fat: number }) {
  return (
    <div className="glass-panel p-6 flex items-center gap-6 hover:border-orange-500 transition-colors cursor-pointer group">
      <div className="text-center min-w-[60px]">
        <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest">{time}</p>
        <Clock size={16} className="mx-auto mt-1 text-[var(--muted-foreground)]" />
      </div>
      <div className="flex-1">
        <h5 className="font-bold">{title}</h5>
        <div className="flex gap-4 mt-2">
          <NutrientSmall label="C" value={carbs} />
          <NutrientSmall label="P" value={protein} />
          <NutrientSmall label="G" value={fat} />
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-orange-500">{calories}</p>
        <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">kcal</p>
      </div>
    </div>
  );
}

function NutrientSmall({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-bold text-[var(--muted-foreground)]">{label}:</span>
      <span className="text-xs font-bold">{value}g</span>
    </div>
  );
}

function NutrientProgress({ label, current, target, color }: { label: string, current: number, target: number, color: string }) {
  const progress = (current / target) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span>{label}</span>
        <span className="text-[var(--muted-foreground)]">{current} / {target}g</span>
      </div>
      <div className="h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden transition-colors">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

function ProfileLink({ icon, label, count, onClick }: { icon: React.ReactNode, label: string, count?: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="glass-panel p-4 flex items-center gap-4 hover:bg-[var(--muted)] transition-colors cursor-pointer group"
    >
      <div className="p-2 bg-[var(--muted)] rounded-xl group-hover:bg-[var(--card)] transition-colors">
        {icon}
      </div>
      <span className="flex-1 font-bold text-sm">{label}</span>
      {count && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">{count}</span>}
      <ChevronRight size={16} className="text-[var(--muted-foreground)]" />
    </div>
  );
}

function Settings() {
  return <div className="p-1"><Activity size={16} /></div>;
}
