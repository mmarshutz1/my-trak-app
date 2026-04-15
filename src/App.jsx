// ==========================================
// ZONE 1: IMPORTS & DEPENDENCIES
// ==========================================
import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Home,
  Scale,
  Utensils,
  Settings,
  Download,
  Upload,
  AlertTriangle,
  Trash2,
  Calendar,
  ChevronLeft, // <-- Add this
  ChevronRight,
} from "lucide-react";

// --- Local Storage Database Engine ---
const DB = {
  KEY_LOGS: "liquid_macros_logs_v2",
  KEY_CONFIG: "liquid_macros_config_v2",
  KEY_FOODS: "liquid_macros_foods_v1",

  getLogs: () => JSON.parse(localStorage.getItem(DB.KEY_LOGS)) || {},
  getConfig: () =>
    JSON.parse(localStorage.getItem(DB.KEY_CONFIG)) || {
      name: "User",
      goals: { protein: 260, fats: 135, carbs: 303 },
    },
  // UPGRADED: Default Library injected if no data exists
  getFoods: () => {
    const stored = localStorage.getItem(DB.KEY_FOODS);
    if (stored) return JSON.parse(stored);

    // The Starter Pack
    return [
      {
        id: 1,
        name: "Large Egg",
        icon: "🥚",
        p: 6,
        f: 5,
        c: 0.6,
        active: true,
      },
      {
        id: 2,
        name: "Whole Milk (1 Cup)",
        icon: "🥛",
        p: 8,
        f: 8,
        c: 12,
        active: true,
      },
      {
        id: 3,
        name: "Chicken Breast (100g)",
        icon: "🍗",
        p: 31,
        f: 4,
        c: 0,
        active: true,
      },
      {
        id: 4,
        name: "White Rice (1 Cup)",
        icon: "🍚",
        p: 4,
        f: 0,
        c: 44,
        active: true,
      },
      {
        id: 5,
        name: "Avocado (Half)",
        icon: "🥑",
        p: 2,
        f: 15,
        c: 9,
        active: true,
      },
      {
        id: 6,
        name: "Whey Protein (1 Scoop)",
        icon: "🥤",
        p: 25,
        f: 2,
        c: 3,
        active: true,
      },
    ];
  },

  saveConfig: (newConfig) => {
    const cfg = { ...DB.getConfig(), ...newConfig };
    localStorage.setItem(DB.KEY_CONFIG, JSON.stringify(cfg));
    return cfg;
  },

  // Danger Zone
  factoryReset: () => {
    localStorage.removeItem(DB.KEY_LOGS);
    localStorage.removeItem(DB.KEY_CONFIG);
    localStorage.removeItem(DB.KEY_FOODS);
  },

  // Backup & Restore
  exportData: () => ({
    logs: DB.getLogs(),
    config: DB.getConfig(),
    foods: DB.getFoods(),
  }),
  importData: (data) => {
    if (data.logs) localStorage.setItem(DB.KEY_LOGS, JSON.stringify(data.logs));
    if (data.config)
      localStorage.setItem(DB.KEY_CONFIG, JSON.stringify(data.config));
    if (data.foods)
      localStorage.setItem(DB.KEY_FOODS, JSON.stringify(data.foods));
  },
};

// --- Timezone Safe Date Helper ---
const getLocalDateStr = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
};

export default function App() {
  // ==========================================
  // ZONE 2: APP STATE & DATA
  // ==========================================
  const [bootState, setBootState] = useState("blank");
  const [activeTab, setActiveTab] = useState("home");

  // NEW: Global Time Machine & Live Clock State
  const [activeDate, setActiveDate] = useState(getLocalDateStr());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    showCancel: false,
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  // ==========================================
  // ZONE 3: LIFECYCLE & EFFECTS
  // ==========================================
  useEffect(() => {
    // --- Live Clock Timer ---
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 60000);

    // --- Boot Sequence ---
    const textTimer = setTimeout(() => {
      setBootState("text");
      if ("vibrate" in navigator) navigator.vibrate(10);
    }, 1000);
    const ekgTimer = setTimeout(() => {
      setBootState("ekg");
      setTimeout(() => {
        if ("vibrate" in navigator) navigator.vibrate([30, 60, 30]);
      }, 800);
    }, 2000);
    const exitTimer = setTimeout(() => {
      setBootState("exiting");
      if ("vibrate" in navigator) navigator.vibrate(20);
    }, 4500);
    const completeTimer = setTimeout(() => {
      setBootState("complete");
    }, 5000);

    return () => {
      clearInterval(clockTimer);
      clearTimeout(textTimer);
      clearTimeout(ekgTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  // ==========================================
  // ZONE 4: HELPER FUNCTIONS
  // ==========================================
  const handleTabClick = (tab) => {
    if (activeTab === tab) return;
    if ("vibrate" in navigator) navigator.vibrate(15);
    setActiveTab(tab);
  };

  const getHeaderTitles = () => {
    switch (activeTab) {
      case "home":
        return { sub: "Dashboard", main: "My Trak" };
      case "weight":
        return { sub: "Metrics", main: "Body Weight" };
      case "macros":
        return { sub: "Nutrition", main: "Macro Tracker" };
      case "settings":
        return { sub: "Preferences", main: "Settings" };
      default:
        return { sub: "Dashboard", main: "My Trak" };
    }
  };

  const header = getHeaderTitles();

  // ==========================================
  // ZONE 5: RENDER UI - BOOT SCREEN
  // ==========================================
  if (bootState !== "complete") {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto relative bg-[#0a0a12] text-white overflow-hidden shadow-2xl gpu-accelerate">
        <style>{`@keyframes drawEkg { 0% { stroke-dashoffset: 300; } 100% { stroke-dashoffset: 0; } }`}</style>
        <div
          className={`flex flex-col items-center transition-all duration-500 ease-out ${bootState === "exiting" ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
        >
          <div className="h-16 w-full flex items-center justify-center mb-2">
            {(bootState === "ekg" || bootState === "exiting") && (
              <svg
                width="140"
                height="40"
                viewBox="0 0 160 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-in fade-in duration-700"
              >
                <path
                  d="M 0 25 H 60 L 67 38 L 80 5 L 93 45 L 100 25 H 160"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-zinc-200"
                  style={{
                    strokeDasharray: 300,
                    strokeDashoffset: 300,
                    animation:
                      "drawEkg 2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                  }}
                />
              </svg>
            )}
          </div>
          <h1
            className={`text-xl font-medium tracking-[0.4em] uppercase text-zinc-200 transition-opacity duration-1000 ${bootState !== "blank" ? "opacity-100" : "opacity-0"}`}
          >
            My Trak
          </h1>
        </div>
      </div>
    );
  }

  // ==========================================
  // ZONE 6: RENDER UI - MAIN APP
  // ==========================================
  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative bg-[#0a0a12] text-white overflow-hidden shadow-2xl animate-in fade-in duration-700 gpu-accelerate">
      <header className="p-6 pt-12 flex justify-between items-center z-10 shrink-0">
        <div>
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] transition-all">
            {header.sub}
          </h2>
          <h1 className="text-2xl font-bold tracking-tight mt-1 transition-all">
            {header.main}
          </h1>
        </div>

        {/* UPGRADED: Custom App-Themed Date Picker */}
        <div className="flex flex-col items-end relative">
          <button
            onClick={() => {
              if ("vibrate" in navigator) navigator.vibrate(10);
              setIsCalendarOpen(true);
            }}
            className="relative flex items-center bg-white/5 hover:bg-white/10 transition-colors rounded-xl px-3 py-2 border border-white/10 active:scale-95 shadow-lg group cursor-pointer"
          >
            <div className="flex flex-col items-end mr-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                {new Date(activeDate + "T12:00:00").toLocaleDateString(
                  "en-US",
                  { weekday: "short", month: "short", day: "numeric" },
                )}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">
                {activeDate === getLocalDateStr()
                  ? currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "History Mode"}
              </span>
            </div>
            <Calendar
              size={18}
              className="text-indigo-400 group-hover:text-indigo-300 transition-colors"
            />
          </button>
        </div>
      </header>

      {/* Passed activeDate down to all dynamic views */}
      <main className="flex-1 overflow-y-auto px-6 pb-40 no-scrollbar">
        {activeTab === "home" && <HomeView activeDate={activeDate} />}
        {activeTab === "weight" && (
          <WeightView setModal={setModal} activeDate={activeDate} />
        )}
        {activeTab === "macros" && (
          <MacrosView setModal={setModal} activeDate={activeDate} />
        )}
        {activeTab === "settings" && <SettingsView setModal={setModal} />}
      </main>

      <nav
        className="absolute left-6 right-6 z-50"
        style={{ bottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      >
        <div className="glass-card bg-[#0a0a12]/90 p-2 w-full select-none">
          <div className="relative flex w-full h-12 items-center justify-between">
            <NavButton
              id="home"
              icon={<Home size={24} />}
              activeTab={activeTab}
              onClick={handleTabClick}
            />
            <NavButton
              id="weight"
              icon={<Scale size={24} />}
              activeTab={activeTab}
              onClick={handleTabClick}
            />
            <NavButton
              id="macros"
              icon={<Utensils size={24} />}
              activeTab={activeTab}
              onClick={handleTabClick}
            />
            <NavButton
              id="settings"
              icon={<Settings size={24} />}
              activeTab={activeTab}
              onClick={handleTabClick}
            />
          </div>
        </div>
      </nav>

      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={() => {
          modal.onConfirm();
          closeModal();
        }}
        onCancel={closeModal}
        showCancel={modal.showCancel}
      />

      <CustomCalendar
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        activeDate={activeDate}
        onDateSelect={setActiveDate}
      />
    </div>
  );
}

// ==========================================
// ZONE 7: SUB-COMPONENTS & VIEWS
// ==========================================

// --- NEW: Custom Glass Calendar Modal ---
function CustomCalendar({ isOpen, onClose, activeDate, onDateSelect }) {
  if (!isOpen) return null;

  const [viewDate, setViewDate] = useState(new Date(activeDate + "T12:00:00"));
  const logs = DB.getLogs(); // Fetch data to power the "dots"

  const todayDate = new Date();
  const todayStr = getLocalDateStr(todayDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => {
    // Lock navigation so you can't scroll into future months
    if (year === todayDate.getFullYear() && month === todayDate.getMonth())
      return;
    setViewDate(new Date(year, month + 1, 1));
  };

  // Build the empty spacer slots for the start of the month
  const days = Array(firstDayOfMonth).fill(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-card bg-[#0a0a12] p-5 rounded-3xl w-full max-w-sm border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-zinc-400 hover:text-white bg-white/5 rounded-xl active:scale-95 transition-all flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-white tracking-wide">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={handleNextMonth}
            className={`p-2 rounded-xl transition-all flex items-center justify-center ${year === todayDate.getFullYear() && month === todayDate.getMonth() ? "text-zinc-700 bg-transparent cursor-not-allowed" : "text-zinc-400 hover:text-white bg-white/5 active:scale-95"}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest"
            >
              {d}
            </div>
          ))}
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="h-10" />;

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isFuture = dateStr > todayStr;
            const isSelected = dateStr === activeDate;
            const isToday = dateStr === todayStr;

            // Check the database to see if we logged anything on this specific date
            const dayData = logs[dateStr];
            const hasData =
              dayData &&
              (dayData.protein > 0 ||
                dayData.fats > 0 ||
                dayData.carbs > 0 ||
                dayData.weight);

            return (
              <button
                key={dateStr}
                disabled={isFuture}
                onClick={() => {
                  if ("vibrate" in navigator) navigator.vibrate(10);
                  onDateSelect(dateStr);
                  onClose();
                }}
                className={`relative h-10 w-full rounded-xl flex items-center justify-center text-sm transition-all
                  ${isFuture ? "text-zinc-700 cursor-not-allowed opacity-50" : "hover:bg-white/10 active:scale-95"}
                  ${isSelected ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20" : "font-medium"}
                  ${isToday && !isSelected ? "border border-indigo-500/50 text-indigo-400" : ""}
                  ${!isFuture && !isSelected && !isToday ? "text-zinc-300" : ""}
                `}
              >
                {day}

                {/* The Data Indicator Dot */}
                {hasData && (
                  <div
                    className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-indigo-400"}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-4">
          <button
            onClick={() => {
              if ("vibrate" in navigator) navigator.vibrate(10);
              onDateSelect(todayStr);
              onClose();
            }}
            className="text-xs font-bold text-indigo-400 uppercase tracking-widest active:scale-95 transition-transform bg-indigo-500/10 px-4 py-2 rounded-lg"
          >
            Go to Today
          </button>
          <button
            onClick={onClose}
            className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest active:scale-95 transition-all px-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// --- NEW: Global Scroll Animation Engine ---
function ScrollReveal({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0,
        // Top margin clears the Header, Bottom margin clears the Nav Dock
        rootMargin: "-100px 0px -120px 0px",
      },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out transform will-change-transform ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-95"
      }`}
    >
      {children}
    </div>
  );
}

// --- NEW: Global Custom Modal Component ---
function CustomModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  showCancel,
}) {
  if (!isOpen) return null;
  return (
    <div
      // CHANGED: z-[100] is now z-[200], and absolute is now fixed
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="glass-card bg-[#0a0a12] p-6 rounded-2xl w-full max-w-sm border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          {showCancel && (
            <button
              onClick={onCancel}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-colors active:scale-95"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold shadow-lg transition-colors active:scale-95"
          >
            {showCancel ? "Confirm" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NavButton({ id, icon, activeTab, onClick }) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`relative flex-1 flex justify-center items-center h-full rounded-xl transition-all duration-200 active:scale-95 ${
        isActive
          ? "text-zinc-100 bg-white/10 shadow-sm"
          : "text-zinc-500 hover:text-zinc-400"
      }`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {icon}
    </button>
  );
}

// --- Candy-Cane SVG Ring Component ---
function ProgressRing({ radius, stroke, progress, max, color }) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = progress / max;
  const isOver = percent > 1;

  const basePercent = Math.min(percent, 1);
  const baseOffset = circumference - basePercent * circumference;

  const overPercent = isOver ? Math.min(percent - 1, 1) : 0;
  const overOffset = circumference - overPercent * circumference;

  const patternId = `stripe-${color.replace("#", "")}`;

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      className="transform -rotate-90"
    >
      <defs>
        <pattern
          id={patternId}
          width="12"
          height="12"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <rect width="12" height="12" fill="#0a0a12" />
          <rect width="6" height="12" fill={color} />
        </pattern>
      </defs>
      <circle
        stroke="rgba(255,255,255,0.05)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + " " + circumference}
        style={{
          strokeDashoffset: baseOffset,
          transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {isOver && (
        <circle
          stroke={`url(#${patternId})`}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + " " + circumference}
          style={{
            strokeDashoffset: overOffset,
            transition:
              "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      )}
    </svg>
  );
}

// --- UPGRADED: Home View (Dynamic 7D Bars / 30D Area Chart) ---
function HomeView({ activeDate }) {
  const config = DB.getConfig();
  const logs = DB.getLogs();

  const [timeframe, setTimeframe] = useState(7);

  const daysArray = Array.from({ length: timeframe }, (_, i) => {
    const d = new Date(activeDate + "T12:00:00");
    d.setDate(d.getDate() - (timeframe - 1 - i));
    return getLocalDateStr(d);
  });

  const chartData = daysArray.map((date) => {
    const log = logs[date] || { protein: 0, fats: 0, carbs: 0 };
    return {
      date,
      label: new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "narrow",
      }),
      p: log.protein || 0,
      f: log.fats || 0,
      c: log.carbs || 0,
      cals: Math.round(log.protein * 4 + log.carbs * 4 + log.fats * 9),
    };
  });

  const targetTotal =
    config.goals.protein + config.goals.fats + config.goals.carbs;
  const maxLoggedTotal = Math.max(...chartData.map((d) => d.p + d.f + d.c));
  const chartMax = Math.max(targetTotal, maxLoggedTotal) || 1;

  let currentStreak = 0;
  const streakArray = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(activeDate + "T12:00:00");
    d.setDate(d.getDate() - i);
    return getLocalDateStr(d);
  });
  if ((logs[streakArray[0]]?.protein || 0) < config.goals.protein)
    streakArray.shift();
  for (const date of streakArray) {
    if ((logs[date]?.protein || 0) >= config.goals.protein) currentStreak++;
    else break;
  }

  const daysLogged = chartData.filter((d) => d.cals > 0);
  const avgCals = daysLogged.length
    ? Math.round(
        daysLogged.reduce((sum, d) => sum + d.cals, 0) / daysLogged.length,
      )
    : 0;

  // -----------------------------------------------------
  // NEW: 30D Stacked Area Chart Math
  // -----------------------------------------------------
  const getAreaPoints = (macroType) => {
    if (chartData.length <= 1) return "";
    let points = `0,100 `; // Start at bottom left
    chartData.forEach((d, i) => {
      const x = (i / (chartData.length - 1)) * 100;
      let yVal = 0;
      if (macroType === "protein") yVal = d.p;
      if (macroType === "fats") yVal = d.p + d.f;
      if (macroType === "carbs") yVal = d.p + d.f + d.c;
      const y = 100 - (yVal / chartMax) * 100;
      points += `${x},${y} `;
    });
    points += `100,100`; // Close at bottom right
    return points;
  };

  const cArea = getAreaPoints("carbs");
  const fArea = getAreaPoints("fats");
  const pArea = getAreaPoints("protein");

  // -----------------------------------------------------
  // Weight Math for the Line Graph (12-Week Trend)
  // -----------------------------------------------------
  const weeklyWeightsMap = {};
  Object.entries(logs).forEach(([date, data]) => {
    if (data.weight) {
      const d = new Date(date + "T12:00:00");
      d.setDate(d.getDate() - d.getDay());
      const sunDate = d.toISOString().split("T")[0];

      if (
        sunDate <= activeDate &&
        (!weeklyWeightsMap[sunDate] ||
          date >= weeklyWeightsMap[sunDate].actualDate)
      ) {
        weeklyWeightsMap[sunDate] = {
          date: sunDate,
          actualDate: date,
          weight: parseFloat(data.weight),
        };
      }
    }
  });

  const weightData = Object.values(weeklyWeightsMap)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-12);

  const latestWeight =
    weightData.length > 0 ? weightData[weightData.length - 1].weight : "--";
  const minW = Math.min(...weightData.map((d) => d.weight));
  const maxW = Math.max(...weightData.map((d) => d.weight));
  const wRange = maxW - minW || 1;

  const weightPoints = weightData
    .map((d, i) => {
      const x = (i / (weightData.length - 1 || 1)) * 100;
      const y = 100 - ((d.weight - minW) / wRange) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col space-y-6 pb-10">
      <ScrollReveal>
        <div className="flex justify-between items-end px-2 mb-2">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-1">
              Hello, {config.name || "User"}
            </h2>
            <p className="text-sm text-zinc-400">
              Snapshot ending on{" "}
              {new Date(activeDate + "T12:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => {
                if ("vibrate" in navigator) navigator.vibrate(10);
                setTimeframe(7);
              }}
              className={`text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider transition-all ${timeframe === 7 ? "bg-indigo-600 text-white" : "text-zinc-500"}`}
            >
              7D
            </button>
            <button
              onClick={() => {
                if ("vibrate" in navigator) navigator.vibrate(10);
                setTimeframe(30);
              }}
              className={`text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider transition-all ${timeframe === 30 ? "bg-indigo-600 text-white" : "text-zinc-500"}`}
            >
              30D
            </button>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-5 relative overflow-hidden">
            {currentStreak > 0 && (
              <div className="absolute inset-0 bg-orange-500/10 opacity-50"></div>
            )}
            <div className="relative z-10 flex flex-col">
              <span className="text-3xl font-bold text-white flex items-center gap-2">
                {currentStreak}{" "}
                {currentStreak > 0 && <span className="text-xl">🔥</span>}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
                Protein Streak
              </span>
            </div>
          </div>
          <div className="glass-card p-5 flex flex-col">
            <span className="text-3xl font-bold text-white">{avgCals}</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
              {timeframe}-Day Avg (Kcal)
            </span>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="glass-card p-6">
          <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-2">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              Macro Trend
            </h3>
          </div>

          {/* DYNAMIC CHART RENDER: Bars for 7D, Area Graph for 30D */}
          {timeframe === 7 ? (
            <div className="flex items-end justify-between h-48 gap-1.5 sm:gap-3">
              {chartData.map((day, i) => {
                const pHeight = (day.p / chartMax) * 100;
                const fHeight = (day.f / chartMax) * 100;
                const cHeight = (day.c / chartMax) * 100;
                const isToday = i === chartData.length - 1;

                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center flex-1 h-full gap-2 group relative"
                  >
                    <div
                      className={`w-full relative flex flex-col justify-end h-full rounded-md overflow-hidden transition-all duration-300 ${isToday ? "bg-white/10" : "bg-black/40"}`}
                    >
                      <div
                        className="absolute w-full h-[1px] bg-white/20 z-10"
                        style={{ bottom: `${(targetTotal / chartMax) * 100}%` }}
                      ></div>
                      <div
                        style={{ height: `${cHeight}%` }}
                        className="bg-green-500 w-full transition-all duration-1000 ease-out"
                      ></div>
                      <div
                        style={{ height: `${fHeight}%` }}
                        className="bg-yellow-500 w-full transition-all duration-1000 ease-out"
                      ></div>
                      <div
                        style={{ height: `${pHeight}%` }}
                        className="bg-blue-500 w-full transition-all duration-1000 ease-out"
                      ></div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase ${isToday ? "text-indigo-400" : "text-zinc-500"}`}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 w-full relative rounded-xl overflow-hidden bg-black/40 border border-white/5">
              <div
                className="absolute w-full h-[1px] bg-white/20 z-10"
                style={{ bottom: `${(targetTotal / chartMax) * 100}%` }}
              ></div>
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full preserve-3d"
                preserveAspectRatio="none"
              >
                {/* Layer 1: Carbs (Green Backing) */}
                <polygon
                  points={cArea}
                  fill="#22c55e"
                  className="opacity-90 transition-all duration-1000"
                />
                {/* Layer 2: Fats (Yellow Middle) */}
                <polygon
                  points={fArea}
                  fill="#eab308"
                  className="opacity-95 transition-all duration-1000"
                />
                {/* Layer 3: Protein (Blue Front) */}
                <polygon
                  points={pArea}
                  fill="#3b82f6"
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
          )}

          <div className="flex justify-center gap-4 mt-6">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Protein
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Fats
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Carbs
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Upgraded Weekly Weight Trend Chart */}
      <ScrollReveal>
        <div className="glass-card p-6 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-2 relative z-10">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              12-Week Weight Trend
            </h3>
          </div>

          <div className="h-32 w-full relative">
            {weightData.length > 1 ? (
              <svg
                viewBox="0 -10 100 120"
                className="w-full h-full preserve-3d"
                preserveAspectRatio="none"
              >
                <polyline
                  points={weightPoints}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_4px_8px_rgba(129,140,248,0.5)]"
                />
                {weightData.map((d, i) => {
                  const x = (i / (weightData.length - 1)) * 100;
                  const y = 100 - ((d.weight - minW) / wRange) * 100;
                  return <circle key={i} cx={x} cy={y} r="2" fill="#fff" />;
                })}
              </svg>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                Not enough weekly data for graph.
              </div>
            )}
          </div>

          <div className="flex justify-between items-end mt-4 relative z-10">
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">
                Current Weekly Weight
              </h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">
                {latestWeight}
              </span>
              <span className="text-sm font-medium text-zinc-500">lbs</span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

// --- UPGRADED: Weight View (Weekly Tracking) ---
function WeightView({ setModal, activeDate }) {
  const [logsState, setLogsState] = useState(DB.getLogs());

  // 1. Time-Machine Math: Find the Sunday of the currently selected week
  const activeSunday = React.useMemo(() => {
    const d = new Date(activeDate + "T12:00:00");
    d.setDate(d.getDate() - d.getDay()); // Subtract current day of week to snap back to Sunday
    return d.toISOString().split("T")[0];
  }, [activeDate]);

  const [weightInput, setWeightInput] = useState(
    logsState[activeSunday]?.weight || "",
  );

  // Sync input field instantly if user travels through time
  useEffect(() => {
    setWeightInput(logsState[activeSunday]?.weight || "");
  }, [activeSunday, logsState]);

  const hapticSuccess = () => {
    if ("vibrate" in navigator) navigator.vibrate([20, 40, 20]);
  };

  // 2. Consolidate History: Group any old daily logs into pristine Weekly (Sunday) chunks
  const weeklyWeightsMap = {};
  Object.entries(logsState).forEach(([date, data]) => {
    if (data.weight) {
      const d = new Date(date + "T12:00:00");
      d.setDate(d.getDate() - d.getDay());
      const sunDate = d.toISOString().split("T")[0];

      // If multiple weights exist for a week, take the latest one
      if (
        !weeklyWeightsMap[sunDate] ||
        date >= weeklyWeightsMap[sunDate].actualDate
      ) {
        weeklyWeightsMap[sunDate] = {
          date: sunDate,
          actualDate: date,
          weight: parseFloat(data.weight),
        };
      }
    }
  });

  const weightHistory = Object.values(weeklyWeightsMap).sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  // 3. Actions
  const handleSaveWeight = (e) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (!w) return;
    hapticSuccess();

    // Always save the weight to the Sunday of the active week!
    const currentLog = logsState[activeSunday] || {
      protein: 0,
      fats: 0,
      carbs: 0,
      entries: [],
    };
    const updatedLog = { ...currentLog, weight: w };

    const newLogs = { ...logsState, [activeSunday]: updatedLog };
    setLogsState(newLogs);
    localStorage.setItem(DB.KEY_LOGS, JSON.stringify(newLogs));
  };

  const handleDeleteWeight = (sundayDate) => {
    if ("vibrate" in navigator) navigator.vibrate([20, 20]);
    setModal({
      isOpen: true,
      title: "Delete Weigh-In?",
      message: `Are you sure you want to remove the weigh-in for the week of ${new Date(sundayDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}?`,
      onConfirm: () => {
        const currentLog = logsState[sundayDate];
        const updatedLog = { ...currentLog };
        delete updatedLog.weight;
        const newLogs = { ...logsState, [sundayDate]: updatedLog };
        setLogsState(newLogs);
        localStorage.setItem(DB.KEY_LOGS, JSON.stringify(newLogs));
      },
      showCancel: true,
    });
  };

  // 4. Calculate Weekly Delta
  const latestLog = weightHistory.find((log) => log.date <= activeSunday);
  const previousLog = weightHistory.find(
    (log) => log.date < (latestLog?.date || activeSunday),
  );

  let weeklyDelta = "--";
  let deltaColor = "text-zinc-400";
  if (latestLog && previousLog) {
    const diff = (latestLog.weight - previousLog.weight).toFixed(1);
    if (diff > 0) {
      weeklyDelta = `+${diff}`;
      deltaColor = "text-orange-400";
    } else if (diff < 0) {
      weeklyDelta = `${diff}`;
      deltaColor = "text-blue-400";
    } else {
      weeklyDelta = "0.0";
    }
  }

  return (
    <div className="flex flex-col space-y-8 pb-10">
      <ScrollReveal>
        <div className="glass-card p-8 flex flex-col items-center relative overflow-hidden">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1 w-full text-left">
            Week Of{" "}
            {new Date(activeSunday + "T12:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
          <p className="text-xs text-zinc-500 mb-6 w-full text-left">
            Sunday is your dedicated weigh-in day.
          </p>

          <form
            onSubmit={handleSaveWeight}
            className="flex flex-col w-full gap-6"
          >
            <div className="relative flex justify-center items-end">
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full bg-transparent text-7xl font-bold text-center text-white border-b-2 border-white/10 focus:border-indigo-500 focus:outline-none pb-2 transition-colors placeholder-white/5"
                placeholder="0.0"
              />
              <span className="absolute bottom-4 right-4 text-zinc-500 text-xl font-bold">
                lbs
              </span>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-lg"
            >
              Save Weekly Weight
            </button>
          </form>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4 flex flex-col justify-center items-center">
            <span className="text-3xl font-bold text-white mb-1">
              {latestLog ? latestLog.weight : "--"}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] text-center">
              Latest Weight
            </span>
          </div>
          <div className="glass-card p-4 flex flex-col justify-center items-center">
            <span className={`text-3xl font-bold mb-1 ${deltaColor}`}>
              {weeklyDelta}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] text-center">
              Weekly Change
            </span>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="glass-card p-4 space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            Weekly History
          </h3>
          <div className="flex flex-col divide-y divide-white/5 max-h-72 overflow-y-auto no-scrollbar">
            {weightHistory.length === 0 ? (
              <p className="text-center text-zinc-500 text-sm py-6">
                No weight history logged yet.
              </p>
            ) : (
              weightHistory.map((log, index) => {
                const prev = weightHistory[index + 1];
                let delta = 0;
                let dColor = "text-zinc-500";
                let dSymbol = "";
                if (prev) {
                  delta = (log.weight - prev.weight).toFixed(1);
                  if (delta > 0) {
                    dColor = "text-orange-400";
                    dSymbol = "↑";
                  } else if (delta < 0) {
                    dColor = "text-blue-400";
                    dSymbol = "↓";
                    delta = Math.abs(delta);
                  }
                }
                return (
                  <div
                    key={log.date}
                    className="flex items-center justify-between py-4 animate-in fade-in slide-in-from-top-2"
                  >
                    <div>
                      <p className="text-lg font-bold text-white">
                        {log.weight}{" "}
                        <span className="text-xs text-zinc-500 font-normal">
                          lbs
                        </span>
                      </p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        Week of{" "}
                        {new Date(log.date + "T12:00:00").toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {prev && (
                        <span
                          className={`text-xs font-bold bg-white/5 px-2 py-1 rounded-md ${dColor}`}
                        >
                          {dSymbol} {delta}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteWeight(log.date)}
                        className="text-zinc-600 hover:text-red-400 transition-colors p-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

// --- UPGRADED: Macros View (Crash-Free & Time Travel Ready) ---
function MacrosView({ setModal, activeDate }) {
  const [goals, setGoals] = useState(DB.getConfig().goals);
  const [todayLog, setTodayLog] = useState(
    DB.getLogs()[activeDate] || { protein: 0, fats: 0, carbs: 0, entries: [] },
  );
  const [foodsState, setFoodsState] = useState(DB.getFoods());

  const [manualMacro, setManualMacro] = useState("protein");
  const [manualAmount, setManualAmount] = useState("");
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [newFood, setNewFood] = useState({
    name: "",
    icon: "🍽️",
    p: "",
    f: "",
    c: "",
  });

  const [searchMode, setSearchMode] = useState("local");
  const [searchQuery, setSearchQuery] = useState("");
  const [apiResults, setApiResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcData, setCalcData] = useState({
    weight: "",
    goal: "maintain",
    activity: "active",
  });
  const [calcResults, setCalcResults] = useState(null);
  const [isActivityDropdownOpen, setIsActivityDropdownOpen] = useState(false);

  // Sync data if the date changes
  useEffect(() => {
    setTodayLog(
      DB.getLogs()[activeDate] || {
        protein: 0,
        fats: 0,
        carbs: 0,
        entries: [],
      },
    );
  }, [activeDate]);

  const hapticLog = () => {
    if ("vibrate" in navigator) navigator.vibrate([15, 30]);
  };

  const totalCalories = Math.round(
    todayLog.protein * 4 + todayLog.carbs * 4 + todayLog.fats * 9,
  );

  const saveLogToDB = (updatedLog) => {
    setTodayLog(updatedLog);
    const logs = DB.getLogs();
    logs[activeDate] = updatedLog; // Explicitly saves to the selected activeDate
    localStorage.setItem(DB.KEY_LOGS, JSON.stringify(logs));
  };

  const saveFoodsToDB = (newFoods) => {
    setFoodsState(newFoods);
    localStorage.setItem(DB.KEY_FOODS, JSON.stringify(newFoods));
  };

  const handleQuickAdd = (food) => {
    hapticLog();
    const newEntry = {
      id: Date.now(),
      name: food.name,
      icon: food.icon,
      p: food.p,
      f: food.f,
      c: food.c,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    saveLogToDB({
      ...todayLog,
      protein: todayLog.protein + food.p,
      fats: todayLog.fats + food.f,
      carbs: todayLog.carbs + food.c,
      entries: [newEntry, ...todayLog.entries],
    });
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    const amount = parseFloat(manualAmount);
    if (!amount || amount <= 0) return;
    hapticLog();
    const newEntry = {
      id: Date.now(),
      name: `Manual (${manualMacro})`,
      icon: "✏️",
      p: manualMacro === "protein" ? amount : 0,
      f: manualMacro === "fats" ? amount : 0,
      c: manualMacro === "carbs" ? amount : 0,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    saveLogToDB({
      ...todayLog,
      protein: todayLog.protein + newEntry.p,
      fats: todayLog.fats + newEntry.f,
      carbs: todayLog.carbs + newEntry.c,
      entries: [newEntry, ...todayLog.entries],
    });
    setManualAmount("");
  };

  const handleRemoveEntry = (entryId, p, f, c) => {
    if ("vibrate" in navigator) navigator.vibrate(10);
    const updatedEntries = todayLog.entries.filter((e) => e.id !== entryId);
    saveLogToDB({
      ...todayLog,
      protein: Math.max(0, todayLog.protein - p),
      fats: Math.max(0, todayLog.fats - f),
      carbs: Math.max(0, todayLog.carbs - c),
      entries: updatedEntries,
    });
  };

  const handlePinRecentToLibrary = (entry) => {
    if ("vibrate" in navigator) navigator.vibrate([10, 20]);
    const cleanName = entry.name
      .replace("Manual (", "")
      .replace(")", "")
      .trim();
    if (foodsState.some((f) => f.name === cleanName && f.p === entry.p)) {
      return setModal({
        isOpen: true,
        title: "Already Pinned",
        message: "This food is already in your library.",
        onConfirm: () => {},
        showCancel: false,
      });
    }
    const newFoodItem = {
      id: Date.now(),
      name: cleanName,
      icon: entry.icon === "✏️" ? "🍽️" : entry.icon,
      p: entry.p,
      f: entry.f,
      c: entry.c,
      active: true,
    };
    saveFoodsToDB([...foodsState, newFoodItem]);
  };

  const handleToggleQuickLog = (foodId) => {
    if ("vibrate" in navigator) navigator.vibrate(10);
    saveFoodsToDB(
      foodsState.map((f) =>
        f.id === foodId ? { ...f, active: !f.active } : f,
      ),
    );
  };

  const handleDeleteLibraryFood = (foodId) => {
    if ("vibrate" in navigator) navigator.vibrate([20, 20]);
    setModal({
      isOpen: true,
      title: "Delete Food?",
      message: "Permanently remove this food from your library?",
      onConfirm: () => saveFoodsToDB(foodsState.filter((f) => f.id !== foodId)),
      showCancel: true,
    });
  };

  const handleCreateFood = (e) => {
    e.preventDefault();
    if ("vibrate" in navigator) navigator.vibrate([10, 20]);
    const newFoodItem = {
      id: Date.now(),
      name: newFood.name,
      icon: newFood.icon || "🍽️",
      p: parseFloat(newFood.p) || 0,
      f: parseFloat(newFood.f) || 0,
      c: parseFloat(newFood.c) || 0,
      active: true,
    };
    saveFoodsToDB([...foodsState, newFoodItem]);
    setNewFood({ name: "", icon: "🍽️", p: "", f: "", c: "" });
    setIsAddingFood(false);
  };

  const handleApiSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://us.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery)}&search_simple=1&action=process&json=1&page_size=20`,
      );
      const data = await response.json();
      const results = data.products
        .filter((p) => p.product_name)
        .map((product) => ({
          id: product.code || Date.now() + Math.random(),
          name: product.product_name,
          icon: "🔍",
          p: Math.round(product.nutriments?.proteins_100g || 0),
          f: Math.round(product.nutriments?.fat_100g || 0),
          c: Math.round(product.nutriments?.carbohydrates_100g || 0),
        }));
      setApiResults(results);
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Network Error",
        message: "Failed to connect to the database.",
        onConfirm: () => {},
        showCancel: false,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const runCalculator = (e) => {
    e.preventDefault();
    const weightLbs = parseFloat(calcData.weight);
    let baseMultiplier =
      calcData.activity === "sedentary"
        ? 12
        : calcData.activity === "active"
          ? 15
          : 18;
    let targetCals = weightLbs * baseMultiplier;
    if (calcData.goal === "lose") targetCals -= 500;
    if (calcData.goal === "gain") targetCals += 300;

    const p = Math.round(weightLbs * 1.0);
    const f = Math.round(weightLbs * 0.4);
    const remainingCals = targetCals - (p * 4 + f * 9);
    const c = Math.max(0, Math.round(remainingCals / 4));

    setCalcResults({
      protein: p,
      fats: f,
      carbs: c,
      cals: Math.round(targetCals),
    });
    if ("vibrate" in navigator) navigator.vibrate([15, 30]);
  };

  const applyCalculatedMacros = () => {
    const newGoals = {
      protein: calcResults.protein,
      fats: calcResults.fats,
      carbs: calcResults.carbs,
    };
    setGoals(newGoals);
    DB.saveConfig({ ...DB.getConfig(), goals: newGoals });
    setIsCalcOpen(false);
    setCalcResults(null);
    if ("vibrate" in navigator) navigator.vibrate([20, 40, 20]);
  };

  return (
    <div className="flex flex-col space-y-8 pb-10">
      <ScrollReveal>
        <div className="glass-card p-6 flex flex-col items-center relative overflow-hidden">
          <div className="flex justify-between items-center w-full mb-6 z-10">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              Daily Fuel
            </h3>
            <button
              onClick={() => {
                if ("vibrate" in navigator) navigator.vibrate(10);
                setIsCalcOpen(true);
              }}
              className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] active:scale-95 transition-all"
            >
              Calculate Macros
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6 mt-2">
            <ProgressRing
              radius={115}
              stroke={10}
              progress={todayLog.carbs}
              max={goals.carbs}
              color="#22c55e"
            />
            <div className="absolute">
              <ProgressRing
                radius={98}
                stroke={10}
                progress={todayLog.fats}
                max={goals.fats}
                color="#eab308"
              />
            </div>
            <div className="absolute">
              <ProgressRing
                radius={81}
                stroke={10}
                progress={todayLog.protein}
                max={goals.protein}
                color="#3b82f6"
              />
            </div>
            <div className="absolute flex flex-col items-center justify-center w-32 h-32 rounded-full">
              <span className="text-4xl font-bold text-white tracking-tighter mb-1">
                {totalCalories}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                Kcal
              </span>
            </div>
          </div>

          <div className="flex justify-between w-full px-2 mt-2">
            <div className="flex flex-col items-center">
              <span
                className={`font-bold text-xl ${todayLog.protein > goals.protein ? "text-blue-300" : "text-blue-400"}`}
              >
                {Math.round(todayLog.protein)}
                <span className="text-sm">g</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">
                / {goals.protein} P
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span
                className={`font-bold text-xl ${todayLog.fats > goals.fats ? "text-yellow-300" : "text-yellow-400"}`}
              >
                {Math.round(todayLog.fats)}
                <span className="text-sm">g</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">
                / {goals.fats} F
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span
                className={`font-bold text-xl ${todayLog.carbs > goals.carbs ? "text-green-300" : "text-green-400"}`}
              >
                {Math.round(todayLog.carbs)}
                <span className="text-sm">g</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">
                / {goals.carbs} C
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-2">
            Quick Log
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {foodsState
              .filter((f) => f.active)
              .map((food) => (
                <button
                  key={`quick-${food.id}`}
                  onClick={() => handleQuickAdd(food)}
                  className="glass-card p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all bg-white/5 hover:bg-white/10"
                >
                  <span className="text-3xl">{food.icon}</span>
                  <span className="text-xs font-bold text-zinc-300 truncate w-full text-center">
                    {food.name}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="glass-card p-4 space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            Manual Entry
          </h3>
          <form onSubmit={handleManualAdd} className="flex gap-2">
            <div className="flex p-1 bg-black/40 rounded-xl flex-1 border border-white/5">
              {["protein", "fats", "carbs"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setManualMacro(m)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${manualMacro === m ? (m === "protein" ? "bg-blue-600 text-white" : m === "fats" ? "bg-yellow-600 text-white" : "bg-green-600 text-white") : "text-zinc-500"}`}
                >
                  {m.charAt(0)}
                </button>
              ))}
            </div>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0g"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              className="w-20 bg-black/40 border border-white/5 rounded-xl px-2 py-2 text-center text-white text-lg font-bold focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="bg-zinc-200 text-black px-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
            >
              +
            </button>
          </form>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="glass-card p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearchMode("local");
                  setSearchQuery("");
                }}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded transition-colors ${searchMode === "local" ? "bg-indigo-600/20 text-indigo-400" : "text-zinc-500"}`}
              >
                My Library
              </button>
              <button
                onClick={() => {
                  setSearchMode("api");
                  setSearchQuery("");
                  setApiResults([]);
                }}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded transition-colors ${searchMode === "api" ? "bg-indigo-600/20 text-indigo-400" : "text-zinc-500"}`}
              >
                Online
              </button>
            </div>
            {searchMode === "local" && (
              <button
                onClick={() => {
                  if ("vibrate" in navigator) navigator.vibrate(10);
                  setIsAddingFood(!isAddingFood);
                }}
                className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
              >
                {isAddingFood ? "Cancel" : "+ Add Custom"}
              </button>
            )}
          </div>

          {isAddingFood && searchMode === "local" && (
            <form
              onSubmit={handleCreateFood}
              onInvalid={(e) => {
                e.preventDefault();
                if ("vibrate" in navigator) navigator.vibrate([10, 20]);
                setModal({
                  isOpen: true,
                  title: "Missing Info",
                  message: "Please enter a food name.",
                  onConfirm: () => {},
                  showCancel: false,
                });
              }}
              className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Food Name"
                  value={newFood.name}
                  onChange={(e) =>
                    setNewFood({ ...newFood, name: e.target.value })
                  }
                  className="flex-1 bg-white/5 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Emoji 🍔"
                  value={newFood.icon}
                  onChange={(e) =>
                    setNewFood({ ...newFood, icon: e.target.value })
                  }
                  className="w-16 bg-white/5 rounded-lg p-2 text-sm text-center text-white focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Protein (g)"
                  value={newFood.p}
                  onChange={(e) =>
                    setNewFood({ ...newFood, p: e.target.value })
                  }
                  className="flex-1 bg-white/5 rounded-lg p-2 text-sm text-center text-blue-300 focus:outline-none"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Fats (g)"
                  value={newFood.f}
                  onChange={(e) =>
                    setNewFood({ ...newFood, f: e.target.value })
                  }
                  className="flex-1 bg-white/5 rounded-lg p-2 text-sm text-center text-yellow-300 focus:outline-none"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Carbs (g)"
                  value={newFood.c}
                  onChange={(e) =>
                    setNewFood({ ...newFood, c: e.target.value })
                  }
                  className="flex-1 bg-white/5 rounded-lg p-2 text-sm text-center text-green-300 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm active:scale-95 transition-all"
              >
                Save to Library
              </button>
            </form>
          )}

          {searchMode === "local" ? (
            <>
              <input
                type="text"
                placeholder="Search my library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <div className="max-h-48 overflow-y-auto no-scrollbar flex flex-col gap-2 border border-white/5 rounded-xl p-2 bg-black/20">
                {foodsState
                  .filter((f) =>
                    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((food) => (
                    <div
                      key={`lib-${food.id}`}
                      className="flex items-center justify-between bg-white/5 p-3 rounded-lg"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => handleQuickAdd(food)}
                      >
                        <span className="text-xl">{food.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">
                            {food.name}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {food.p}p / {food.f}f / {food.c}c
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleQuickLog(food.id)}
                          className={`text-[10px] px-3 py-1.5 rounded-md font-bold uppercase tracking-wider transition-colors active:scale-95 ${food.active ? "bg-indigo-600/20 text-indigo-400" : "bg-white/10 text-zinc-400"}`}
                        >
                          {food.active ? "Pinned" : "Pin"}
                        </button>
                        <button
                          onClick={() => handleDeleteLibraryFood(food.id)}
                          className="text-zinc-600 hover:text-red-400 p-1 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleApiSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search OpenFoodFacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-indigo-600 text-white px-4 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center"
                >
                  {isSearching ? "..." : "🔍"}
                </button>
              </form>
              <div className="max-h-48 overflow-y-auto no-scrollbar flex flex-col gap-2 border border-white/5 rounded-xl p-2 bg-black/20">
                {apiResults.length > 0 ? (
                  apiResults.map((food) => (
                    <div
                      key={`api-${food.id}`}
                      className="flex items-center justify-between bg-white/5 p-3 rounded-lg"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => handleQuickAdd(food)}
                      >
                        <span className="text-xl">{food.icon}</span>
                        <div className="flex flex-col pr-2">
                          <span className="text-sm font-bold text-white leading-tight">
                            {food.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 mt-1">
                            Per 100g: {food.p}p / {food.f}f / {food.c}c
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickAdd(food)}
                        className="text-[10px] px-4 py-2 rounded-md font-bold uppercase tracking-wider bg-indigo-600/20 text-indigo-400 transition-colors active:scale-95 shrink-0"
                      >
                        Log
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-xs text-center py-2">
                    {isSearching
                      ? "Searching..."
                      : "Search the web to easily log items."}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollReveal>

      {todayLog.entries.length > 0 && (
        <ScrollReveal>
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-2">
              Log History
            </h3>
            <div className="glass-card flex flex-col divide-y divide-white/5">
              {todayLog.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{entry.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">
                        {entry.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {entry.time} •{" "}
                        <span className="text-blue-400">{entry.p}p</span> /{" "}
                        <span className="text-yellow-400">{entry.f}f</span> /{" "}
                        <span className="text-green-400">{entry.c}c</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePinRecentToLibrary(entry)}
                      className="p-2 text-zinc-500 hover:text-indigo-400 transition-colors"
                    >
                      ⭐
                    </button>
                    <button
                      onClick={() =>
                        handleRemoveEntry(entry.id, entry.p, entry.f, entry.c)
                      }
                      className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Calculator Overlay */}
      {isCalcOpen && (
        <div
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200"
          onClick={() => {
            setIsCalcOpen(false);
            setCalcResults(null);
          }}
        >
          <div
            className="glass-card bg-[#0a0a12] p-6 rounded-2xl w-full max-w-md border-white/10 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Macro Calculator</h2>
              <button
                onClick={() => {
                  setIsCalcOpen(false);
                  setCalcResults(null);
                }}
                className="text-zinc-500 hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            {!calcResults ? (
              <form
                onSubmit={runCalculator}
                onInvalid={(e) => {
                  e.preventDefault();
                  if ("vibrate" in navigator) navigator.vibrate([10, 20]);
                  setModal({
                    isOpen: true,
                    title: "Missing Info",
                    message:
                      "Please enter your body weight to calculate your macros.",
                    onConfirm: () => {},
                    showCancel: false,
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">
                    Body Weight (lbs)
                  </label>
                  <input
                    type="number"
                    required
                    value={calcData.weight}
                    onChange={(e) =>
                      setCalcData({ ...calcData, weight: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 180"
                  />
                </div>
                <div
                  className={`relative transition-all ${isActivityDropdownOpen ? "z-50" : "z-10"}`}
                >
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">
                    Activity Level
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if ("vibrate" in navigator) navigator.vibrate(10);
                      setIsActivityDropdownOpen(!isActivityDropdownOpen);
                    }}
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-indigo-500 flex justify-between items-center transition-colors"
                  >
                    <span>
                      {calcData.activity === "sedentary"
                        ? "Sedentary (Office/Desk Job)"
                        : calcData.activity === "active"
                          ? "Active (Workout 3-5x / week)"
                          : "Athlete (Heavy Training)"}
                    </span>
                    <span
                      className={`text-zinc-500 text-xs transition-transform duration-300 ${isActivityDropdownOpen ? "rotate-180" : ""}`}
                    >
                      ▼
                    </span>
                  </button>
                  {isActivityDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[190]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsActivityDropdownOpen(false);
                        }}
                      />
                      <div className="absolute top-[100%] left-0 right-0 mt-2 bg-[#12121a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[200] animate-in fade-in slide-in-from-top-2 duration-200">
                        {[
                          {
                            id: "sedentary",
                            label: "Sedentary (Office/Desk Job)",
                          },
                          {
                            id: "active",
                            label: "Active (Workout 3-5x / week)",
                          },
                          { id: "athlete", label: "Athlete (Heavy Training)" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              if ("vibrate" in navigator) navigator.vibrate(10);
                              setCalcData({ ...calcData, activity: opt.id });
                              setIsActivityDropdownOpen(false);
                            }}
                            className={`w-full text-left p-4 text-sm transition-colors ${calcData.activity === opt.id ? "text-indigo-400 bg-indigo-500/10 font-bold" : "text-zinc-300 hover:bg-white/5 active:bg-white/10"}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">
                    Primary Goal
                  </label>
                  <div className="flex gap-2">
                    {["lose", "maintain", "gain"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setCalcData({ ...calcData, goal: g })}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${calcData.goal === g ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" : "bg-black/40 border-white/5 text-zinc-500"}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl mt-4 active:scale-95 transition-all"
                >
                  Calculate Targets
                </button>
              </form>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-center">
                  <span className="text-4xl font-bold text-white">
                    {calcResults.cals}
                  </span>
                  <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
                    Daily Calories
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex flex-col items-center">
                    <span className="text-blue-400 font-bold text-xl">
                      {calcResults.protein}g
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                      Protein
                    </span>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex flex-col items-center">
                    <span className="text-yellow-400 font-bold text-xl">
                      {calcResults.fats}g
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                      Fats
                    </span>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex flex-col items-center">
                    <span className="text-green-400 font-bold text-xl">
                      {calcResults.carbs}g
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                      Carbs
                    </span>
                  </div>
                </div>
                <button
                  onClick={applyCalculatedMacros}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  Set as My Daily Goals
                </button>
                <button
                  onClick={() => setCalcResults(null)}
                  className="w-full bg-white/5 hover:bg-white/10 text-zinc-400 font-bold py-4 rounded-xl active:scale-95 transition-all"
                >
                  Recalculate
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Settings View ---
function SettingsView({ setModal }) {
  const [config, setConfig] = useState(DB.getConfig());
  const fileInputRef = useRef(null);

  const hapticTap = () => {
    if ("vibrate" in navigator) navigator.vibrate(15);
  };
  const hapticSuccess = () => {
    if ("vibrate" in navigator) navigator.vibrate([20, 40, 20]);
  };

  const handleGoalChange = (macro, value) => {
    const newGoals = { ...config.goals, [macro]: parseInt(value) || 0 };
    const newConfig = { ...config, goals: newGoals };
    setConfig(newConfig);
    DB.saveConfig(newConfig);
  };

  const handleNameChange = (e) => {
    const newConfig = { ...config, name: e.target.value };
    setConfig(newConfig);
    DB.saveConfig(newConfig);
  };

  const handleExport = () => {
    hapticTap();
    const data = DB.exportData();
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MyTrak_BACKUP_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    hapticSuccess();
  };

  const handleImportClick = () => {
    hapticTap();
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        DB.importData(importedData);
        hapticSuccess();
        setModal({
          isOpen: true,
          title: "Restore Complete",
          message:
            "Data restored successfully! The app will now reload to apply changes.",
          onConfirm: () => window.location.reload(),
          showCancel: false,
        });
      } catch (err) {
        setModal({
          isOpen: true,
          title: "Restore Failed",
          message: "The backup file is invalid or corrupted.",
          onConfirm: () => {},
          showCancel: false,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if ("vibrate" in navigator) navigator.vibrate([50, 50, 50]);
    setModal({
      isOpen: true,
      title: "Factory Reset",
      message:
        "WARNING: This will permanently delete all logs, foods, and settings. Are you sure you want to proceed?",
      onConfirm: () => {
        DB.factoryReset();
        window.location.reload();
      },
      showCancel: true,
    });
  };

  return (
    <div className="flex flex-col space-y-8 pb-10">
      <ScrollReveal>
        <div className="glass-card p-4 bg-yellow-500/10 border-yellow-500/30 flex items-start gap-4">
          <div className="shrink-0 mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-yellow-500"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-1">
              Data Risk Warning
            </h3>
            <p className="text-xs text-yellow-200/80 leading-relaxed">
              Because this is a web app, your data lives in your browser's
              cache. Export your data regularly to keep it safe.
            </p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="glass-card p-5 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={handleNameChange}
              className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2">
              Daily Targets
            </label>
            <div className="space-y-4">
              {["protein", "fats", "carbs"].map((macro) => (
                <div key={macro} className="flex justify-between items-center">
                  <span className="capitalize text-sm font-medium text-zinc-300">
                    {macro}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={config.goals[macro]}
                      onChange={(e) => handleGoalChange(macro, e.target.value)}
                      className="w-20 bg-black/40 border border-white/5 rounded-lg p-2 text-right text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <span className="text-zinc-600 text-sm">g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="glass-card p-5 space-y-4">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-2">
            Data Manager
          </label>
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>{" "}
            Export Backup (.json)
          </button>
          <button
            onClick={handleImportClick}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl active:scale-95 transition-all border border-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>{" "}
            Restore from Backup
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="pt-4">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-4 rounded-xl active:scale-95 transition-all border border-red-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>{" "}
            Factory Reset
          </button>
        </div>
      </ScrollReveal>
    </div>
  );
}
