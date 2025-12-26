import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit2, Check, X, Flame, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Types for habit data structure
interface HabitData {
  [habitId: string]: {
    name: string;
    completedDays: number[]; // Array of day numbers (1-31)
    createdAt: string;
  };
}

interface MonthData {
  [monthKey: string]: HabitData; // monthKey format: "YYYY-MM"
}

// Get current period key based on 30-day cycles from start of year
const getCurrentPeriodKey = (): string => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const periodNumber = Math.floor(dayOfYear / 30) + 1;
  return `${now.getFullYear()}-P${periodNumber}`;
};

// Get period info (start date, end date, current day within period)
const getPeriodInfo = (periodKey: string) => {
  const [year, periodPart] = periodKey.split("-");
  const periodNumber = parseInt(periodPart.replace("P", ""));
  const startDayOfYear = (periodNumber - 1) * 30;
  
  const startDate = new Date(parseInt(year), 0, 1 + startDayOfYear);
  const endDate = new Date(parseInt(year), 0, startDayOfYear + 30);
  
  // Calculate current day within this period
  const now = new Date();
  const currentPeriodKey = getCurrentPeriodKey();
  
  let currentDayInPeriod = DAYS_IN_PERIOD;
  if (periodKey === currentPeriodKey) {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    currentDayInPeriod = (dayOfYear % 30) + 1;
  }
  
  return {
    startDate,
    endDate,
    currentDayInPeriod,
    periodNumber,
    year: parseInt(year)
  };
};

// Fixed 30-day tracking period
const DAYS_IN_PERIOD = 30;
// Calculate streak for a habit (works with 30-day period)
const calculateStreak = (completedDays: number[], currentDay: number): number => {
  let streak = 0;
  
  for (let day = currentDay; day >= 1; day--) {
    if (completedDays.includes(day)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

// Generate unique ID
const generateId = (): string => {
  return `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Storage key for localStorage
const STORAGE_KEY = "habit_tracker_data";

// Load data from localStorage
const loadData = (): MonthData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save data to localStorage
const saveData = (data: MonthData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const HabitTracker = () => {
  const [periodKey, setPeriodKey] = useState(getCurrentPeriodKey());
  const [data, setData] = useState<MonthData>(loadData);
  const [newHabitName, setNewHabitName] = useState("");
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const periodInfo = getPeriodInfo(periodKey);
  const habits = data[periodKey] || {};
  const habitIds = Object.keys(habits);
  const currentDay = periodInfo.currentDayInPeriod;
  const isCurrentPeriod = periodKey === getCurrentPeriodKey();

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Add a new habit
  const addHabit = () => {
    if (!newHabitName.trim()) return;

    const habitId = generateId();
    setData((prev) => ({
      ...prev,
      [periodKey]: {
        ...prev[periodKey],
        [habitId]: {
          name: newHabitName.trim(),
          completedDays: [],
          createdAt: new Date().toISOString(),
        },
      },
    }));
    setNewHabitName("");
    setIsAddingHabit(false);
  };

  // Delete a habit
  const deleteHabit = (habitId: string) => {
    setData((prev) => {
      const newPeriodData = { ...prev[periodKey] };
      delete newPeriodData[habitId];
      return { ...prev, [periodKey]: newPeriodData };
    });
  };

  // Toggle habit completion for a day
  const toggleDay = (habitId: string, day: number) => {
    setData((prev) => {
      const habit = prev[periodKey]?.[habitId];
      if (!habit) return prev;

      const completedDays = habit.completedDays.includes(day)
        ? habit.completedDays.filter((d) => d !== day)
        : [...habit.completedDays, day];

      return {
        ...prev,
        [periodKey]: {
          ...prev[periodKey],
          [habitId]: { ...habit, completedDays },
        },
      };
    });
  };

  // Start editing a habit name
  const startEditing = (habitId: string) => {
    setEditingHabit(habitId);
    setEditName(habits[habitId].name);
  };

  // Save edited habit name
  const saveEdit = () => {
    if (!editingHabit || !editName.trim()) return;

    setData((prev) => ({
      ...prev,
      [periodKey]: {
        ...prev[periodKey],
        [editingHabit]: {
          ...prev[periodKey][editingHabit],
          name: editName.trim(),
        },
      },
    }));
    setEditingHabit(null);
    setEditName("");
  };

  // Navigate periods
  const navigatePeriod = (direction: number) => {
    const [year, periodPart] = periodKey.split("-");
    const currentPeriod = parseInt(periodPart.replace("P", ""));
    let newPeriod = currentPeriod + direction;
    let newYear = parseInt(year);
    
    // Handle year boundaries (12 periods per year approximately)
    if (newPeriod < 1) {
      newYear -= 1;
      newPeriod = 12;
    } else if (newPeriod > 12) {
      newYear += 1;
      newPeriod = 1;
    }
    
    setPeriodKey(`${newYear}-P${newPeriod}`);
  };

  // Format period for display
  const formatPeriodDisplay = (key: string): string => {
    const info = getPeriodInfo(key);
    const startStr = info.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endStr = info.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${startStr} - ${endStr}, ${info.year}`;
  };

  // Calculate completion percentage
  const getCompletionPercentage = (habitId: string): number => {
    const habit = habits[habitId];
    if (!habit) return 0;
    const relevantDays = isCurrentPeriod ? currentDay : DAYS_IN_PERIOD;
    return Math.round((habit.completedDays.length / relevantDays) * 100);
  };

  // Get total period stats
  const getPeriodStats = () => {
    const totalHabits = habitIds.length;
    if (totalHabits === 0) return { avgCompletion: 0, totalChecks: 0, bestStreak: 0 };

    const relevantDays = isCurrentPeriod ? currentDay : DAYS_IN_PERIOD;
    let totalChecks = 0;
    let bestStreak = 0;

    habitIds.forEach((id) => {
      const habit = habits[id];
      totalChecks += habit.completedDays.length;
      const streak = calculateStreak(habit.completedDays, currentDay);
      if (streak > bestStreak) bestStreak = streak;
    });

    const avgCompletion = Math.round(
      (totalChecks / (totalHabits * relevantDays)) * 100
    );

    return { avgCompletion, totalChecks, bestStreak };
  };

  const stats = getPeriodStats();

  // Get day label for header (just shows "Day X")
  const getDayLabel = (day: number): string => {
    return `Day`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Habit Tracker</h1>
                <p className="text-sm text-muted-foreground">Build better habits, one day at a time</p>
              </div>
            </div>
            
            {/* Period Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigatePeriod(-1)}
                className="text-muted-foreground hover:text-foreground"
              >
                ←
              </Button>
              <span className="text-sm font-medium min-w-[180px] text-center">
                {formatPeriodDisplay(periodKey)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigatePeriod(1)}
                className="text-muted-foreground hover:text-foreground"
              >
                →
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Avg. Completion</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.avgCompletion}%</p>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-card border border-border animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Total Check-ins</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.totalChecks}</p>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-card border border-border animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Best Streak</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.bestStreak} days</p>
          </div>
        </div>

        {/* Add Habit Button */}
        {!isAddingHabit && (
          <Button
            onClick={() => setIsAddingHabit(true)}
            className="mb-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Habit
          </Button>
        )}

        {/* Add Habit Form */}
        {isAddingHabit && (
          <div className="bg-card rounded-xl p-4 mb-6 shadow-card border border-border animate-scale-in">
            <div className="flex gap-3">
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Enter habit name..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && addHabit()}
                autoFocus
              />
              <Button onClick={addHabit} size="sm" className="bg-primary text-primary-foreground">
                <Check className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  setIsAddingHabit(false);
                  setNewHabitName("");
                }}
                size="sm"
                variant="ghost"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Habits Table */}
        {habitIds.length > 0 ? (
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden animate-fade-in">
            <div
              ref={tableContainerRef}
              className="overflow-x-auto scrollbar-hide"
            >
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="sticky left-0 z-10 bg-muted/50 backdrop-blur-sm px-4 py-3 text-left text-sm font-medium text-muted-foreground min-w-[200px]">
                      Habit
                    </th>
                    {Array.from({ length: DAYS_IN_PERIOD }, (_, i) => i + 1).map((day) => (
                      <th
                        key={day}
                        className={cn(
                          "px-2 py-3 text-center text-xs font-medium min-w-[40px]",
                          isCurrentPeriod && day === currentDay
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        <div>{day}</div>
                      </th>
                    ))}
                    <th className="sticky right-0 z-10 bg-muted/50 backdrop-blur-sm px-4 py-3 text-center text-sm font-medium text-muted-foreground min-w-[100px]">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {habitIds.map((habitId, index) => {
                    const habit = habits[habitId];
                    const percentage = getCompletionPercentage(habitId);
                    const streak = calculateStreak(habit.completedDays, currentDay);

                    return (
                      <tr
                        key={habitId}
                        className={cn(
                          "border-b border-border/50 hover:bg-muted/20 transition-colors",
                          index % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                        )}
                      >
                        {/* Habit Name Cell */}
                        <td className="sticky left-0 z-10 bg-card backdrop-blur-sm px-4 py-3">
                          {editingHabit === habitId ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-8 text-sm"
                                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                                autoFocus
                              />
                              <Button onClick={saveEdit} size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => setEditingHabit(null)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{habit.name}</span>
                                {streak > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                                    <Flame className="w-3 h-3" />
                                    {streak}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  onClick={() => startEditing(habitId)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => deleteHabit(habitId)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Day Checkboxes */}
                        {Array.from({ length: DAYS_IN_PERIOD }, (_, i) => i + 1).map((day) => {
                          const isCompleted = habit.completedDays.includes(day);
                          const isPast = isCurrentPeriod && day < currentDay;
                          const isFuture = isCurrentPeriod && day > currentDay;

                          return (
                            <td key={day} className="px-2 py-2 text-center">
                              <button
                                onClick={() => toggleDay(habitId, day)}
                                disabled={isFuture}
                                className={cn(
                                  "w-7 h-7 rounded-lg border-2 transition-all duration-200 flex items-center justify-center mx-auto",
                                  isCompleted
                                    ? "bg-primary border-primary text-primary-foreground shadow-glow animate-check-bounce"
                                    : isPast
                                    ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
                                    : isFuture
                                    ? "border-border/30 bg-muted/20 cursor-not-allowed"
                                    : "border-border hover:border-primary/50 hover:bg-primary/5",
                                  isCurrentPeriod && day === currentDay && !isCompleted && "border-primary/50 ring-2 ring-primary/20"
                                )}
                              >
                                {isCompleted && <Check className="w-4 h-4" />}
                              </button>
                            </td>
                          );
                        })}

                        {/* Progress Cell */}
                        <td className="sticky right-0 z-10 bg-card backdrop-blur-sm px-4 py-3">
                          <div className="flex flex-col items-center gap-1">
                            <span className={cn(
                              "text-sm font-semibold",
                              percentage >= 80 ? "text-success" : percentage >= 50 ? "text-warning" : "text-muted-foreground"
                            )}>
                              {percentage}%
                            </span>
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  background: percentage >= 80 
                                    ? "hsl(var(--success))" 
                                    : percentage >= 50 
                                    ? "hsl(var(--warning))" 
                                    : "hsl(var(--muted-foreground))"
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl p-12 shadow-card border border-border text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building better habits by adding your first one!
            </p>
            <Button
              onClick={() => setIsAddingHabit(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Habit
            </Button>
          </div>
        )}

        {/* Monthly Summary */}
        {habitIds.length > 0 && (
          <div className="mt-8 bg-card rounded-xl p-6 shadow-card border border-border animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habitIds.map((habitId) => {
                const habit = habits[habitId];
                const percentage = getCompletionPercentage(habitId);
                const streak = calculateStreak(habit.completedDays, currentDay);

                return (
                  <div
                    key={habitId}
                    className="bg-muted/30 rounded-lg p-4 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-foreground">{habit.name}</span>
                      {streak > 0 && (
                        <span className="flex items-center gap-1 text-xs text-warning">
                          <Flame className="w-3 h-3" />
                          {streak} day streak
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${percentage}%`,
                            background: percentage >= 80 
                              ? "hsl(var(--success))" 
                              : percentage >= 50 
                              ? "hsl(var(--warning))" 
                              : "hsl(var(--muted-foreground))"
                          }}
                        />
                      </div>
                      <span className={cn(
                        "text-sm font-semibold min-w-[3rem] text-right",
                        percentage >= 80 ? "text-success" : percentage >= 50 ? "text-warning" : "text-muted-foreground"
                      )}>
                        {percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {habit.completedDays.length} of {isCurrentPeriod ? currentDay : DAYS_IN_PERIOD} days completed
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HabitTracker;
