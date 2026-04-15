export const DB = {
  KEY_LOGS: "liquid_macros_logs_v2",
  KEY_CONFIG: "liquid_macros_config_v2",
  KEY_FOODS: "liquid_macros_foods_v1",

  getLogs: () => {
    try {
      return JSON.parse(localStorage.getItem(DB.KEY_LOGS)) || {};
    } catch {
      return {};
    }
  },
  getConfig: () => {
    try {
      return (
        JSON.parse(localStorage.getItem(DB.KEY_CONFIG)) || {
          goals: { protein: 260, fats: 135, carbs: 303 },
          name: "Manuel",
        }
      );
    } catch {
      return {
        goals: { protein: 260, fats: 135, carbs: 303 },
        name: "Manuel",
      };
    }
  },
  getFoods: () => {
    try {
      const stored = JSON.parse(localStorage.getItem(DB.KEY_FOODS));
      if (stored) return stored;
      return [
        { id: 1, name: "Egg", icon: "🥚", p: 6, f: 5, c: 0.6, active: true },
        {
          id: 2,
          name: "McChicken",
          icon: "🍔",
          p: 14,
          f: 21,
          c: 38,
          active: true,
        },
        {
          id: 3,
          name: "Rice",
          icon: "🍚",
          p: 4.3,
          f: 0.4,
          c: 44,
          active: true,
        },
      ];
    } catch {
      return [];
    }
  },

  saveLog: (date, data) => {
    const logs = DB.getLogs();
    logs[date] = {
      ...(logs[date] || {
        protein: 0,
        fats: 0,
        carbs: 0,
        weight: "",
        entries: [],
      }),
      ...data,
    };
    localStorage.setItem(DB.KEY_LOGS, JSON.stringify(logs));
    return logs[date];
  },

  saveConfig: (newConfig) => {
    const cfg = { ...DB.getConfig(), ...newConfig };
    localStorage.setItem(DB.KEY_CONFIG, JSON.stringify(cfg));
    return cfg;
  },

  saveFoods: (foods) => {
    localStorage.setItem(DB.KEY_FOODS, JSON.stringify(foods));
    return foods;
  },

  resetLog: (date) => {
    const logs = DB.getLogs();
    if (logs[date]) {
      delete logs[date];
      localStorage.setItem(DB.KEY_LOGS, JSON.stringify(logs));
    }
    return { protein: 0, fats: 0, carbs: 0, weight: "", entries: [] };
  },
};
