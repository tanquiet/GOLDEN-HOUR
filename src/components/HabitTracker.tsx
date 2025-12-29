import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit2, Check, X, Flame, TrendingUp, Calendar, ChevronLeft, ChevronRight, LogOut } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
// Types for habit data structure
interface HabitEntry {
  name: string;
  completedDates: string[]; // Array of date strings "YYYY-MM-DD"
  createdAt: string;
}

interface TrackerData {
  startDate: string; // "YYYY-MM-DD"
  habits: { [habitId: string]: HabitEntry };
}

// Fixed display window of 30 days
const DAYS_TO_SHOW = 30;

// Storage key
const STORAGE_KEY = "habit_tracker_v2";

// Date utilities
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const parseDate = (dateStr: string): Date => {
  return new Date(dateStr + "T00:00:00");
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getDaysBetween = (start: Date, end: Date): number => {
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Load data from localStorage
const loadData = (): TrackerData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Save data to localStorage
const saveData = (data: TrackerData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Generate unique ID
const generateId = (): string => {
  return `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate streak from a specific date going backwards
const calculateStreak = (completedDates: string[], fromDate: Date): number => {
  let streak = 0;
  let checkDate = new Date(fromDate);
  
  while (true) {
    const dateStr = formatDate(checkDate);
    if (completedDates.includes(dateStr)) {
      streak++;
      checkDate = addDays(checkDate, -1);
    } else {
      break;
    }
  }
  return streak;
};

// Setup Screen Component
const SetupScreen = ({ onComplete }: { onComplete: (date: string) => void }) => {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-8 shadow-card border border-border max-w-md w-full animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to GOLDENHOUR</h1>
          <p className="text-muted-foreground">
            Choose your start date to begin tracking your daily habits
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-center text-lg"
              max={formatDate(new Date())}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              You can start from today or any past date
            </p>
          </div>

          <Button
            onClick={() => onComplete(selectedDate)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg"
          >
            Start Tracking
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Tracker Component
const HabitTracker = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<TrackerData | null>(loadData);
  const [viewOffset, setViewOffset] = useState(0); // Offset from latest 30-day window
  const [newHabitName, setNewHabitName] = useState("");
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Persist data whenever it changes
  useEffect(() => {
    if (data) {
      saveData(data);
    }
  }, [data]);

  // Handle setup completion
  const handleSetupComplete = (startDate: string) => {
    const newData: TrackerData = {
      startDate,
      habits: {},
    };
    setData(newData);
    saveData(newData);
  };

  // Show setup screen if no data
  if (!data) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  const today = new Date();
  const startDate = parseDate(data.startDate);
  const totalDaysSinceStart = getDaysBetween(startDate, today) + 1;
  
  // Calculate the current view window
  const windowEndOffset = viewOffset * DAYS_TO_SHOW;
  const windowStartOffset = windowEndOffset + DAYS_TO_SHOW - 1;
  
  // Get dates for current view window
  const getDatesInView = (): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const daysFromToday = windowEndOffset + (DAYS_TO_SHOW - 1 - i);
      const date = addDays(today, -daysFromToday);
      // Only include dates from start date onwards
      if (date >= startDate) {
        dates.push(date);
      }
    }
    return dates;
  };

  const datesInView = getDatesInView();
  const habits = data.habits;
  const habitIds = Object.keys(habits);

  // Check if we can navigate
  const canGoBack = windowStartOffset < totalDaysSinceStart - 1;
  const canGoForward = viewOffset > 0;

  // Navigate view window
  const navigateWindow = (direction: number) => {
    if (direction > 0 && canGoBack) {
      setViewOffset(viewOffset + 1);
    } else if (direction < 0 && canGoForward) {
      setViewOffset(viewOffset - 1);
    }
  };

  // Format date range for display
  const formatDateRange = (): string => {
    if (datesInView.length === 0) return "";
    const first = datesInView[0];
    const last = datesInView[datesInView.length - 1];
    const formatOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${first.toLocaleDateString("en-US", formatOpts)} - ${last.toLocaleDateString("en-US", formatOpts)}, ${last.getFullYear()}`;
  };

  // Add a new habit
  const addHabit = () => {
    if (!newHabitName.trim() || !data) return;

    const habitId = generateId();
    setData({
      ...data,
      habits: {
        ...data.habits,
        [habitId]: {
          name: newHabitName.trim(),
          completedDates: [],
          createdAt: new Date().toISOString(),
        },
      },
    });
    setNewHabitName("");
    setIsAddingHabit(false);
  };

  // Delete a habit
  const deleteHabit = (habitId: string) => {
    if (!data) return;
    const newHabits = { ...data.habits };
    delete newHabits[habitId];
    setData({ ...data, habits: newHabits });
  };

  // Toggle habit completion for a date
  const toggleDate = (habitId: string, dateStr: string) => {
    if (!data) return;
    const habit = data.habits[habitId];
    if (!habit) return;

    const completedDates = habit.completedDates.includes(dateStr)
      ? habit.completedDates.filter((d) => d !== dateStr)
      : [...habit.completedDates, dateStr];

    setData({
      ...data,
      habits: {
        ...data.habits,
        [habitId]: { ...habit, completedDates },
      },
    });
  };

  // Start editing
  const startEditing = (habitId: string) => {
    setEditingHabit(habitId);
    setEditName(habits[habitId].name);
  };

  // Save edit
  const saveEdit = () => {
    if (!editingHabit || !editName.trim() || !data) return;

    setData({
      ...data,
      habits: {
        ...data.habits,
        [editingHabit]: {
          ...data.habits[editingHabit],
          name: editName.trim(),
        },
      },
    });
    setEditingHabit(null);
    setEditName("");
  };

  // Calculate completion percentage for current view
  const getCompletionPercentage = (habitId: string): number => {
    const habit = habits[habitId];
    if (!habit || datesInView.length === 0) return 0;
    
    const completedInView = datesInView.filter((date) =>
      habit.completedDates.includes(formatDate(date))
    ).length;
    
    return Math.round((completedInView / datesInView.length) * 100);
  };

  // Get overall stats
  const getStats = () => {
    if (habitIds.length === 0) return { avgCompletion: 0, totalChecks: 0, bestStreak: 0 };

    let totalChecks = 0;
    let bestStreak = 0;
    let totalPercentage = 0;

    habitIds.forEach((id) => {
      const habit = habits[id];
      totalChecks += habit.completedDates.length;
      const streak = calculateStreak(habit.completedDates, today);
      if (streak > bestStreak) bestStreak = streak;
      totalPercentage += getCompletionPercentage(id);
    });

    return {
      avgCompletion: Math.round(totalPercentage / habitIds.length),
      totalChecks,
      bestStreak,
    };
  };

  const stats = getStats();
  const todayStr = formatDate(today);

  return (
    <div className="min-h-screen bg-background" lang="en">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">GOLDENHOUR</h1>
                <p className="text-sm text-muted-foreground">
                  Day {totalDaysSinceStart} • Started {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateWindow(1)}
                disabled={!canGoBack}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[180px] text-center hidden sm:block">
                {formatDateRange()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateWindow(-1)}
                disabled={!canGoForward}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <div className="ml-2 pl-2 border-l border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main" aria-labelledby="habit-tracker-heading">
        <h1 id="habit-tracker-heading" className="sr-only">GOLDENHOUR Dashboard</h1>
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
        {habitIds.length > 0 && datesInView.length > 0 ? (
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden animate-fade-in">
            <div ref={tableContainerRef} className="overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="sticky left-0 z-10 bg-muted/50 backdrop-blur-sm px-4 py-3 text-left text-sm font-medium text-muted-foreground min-w-[200px]">
                      Habit
                    </th>
                    {datesInView.map((date) => {
                      const dateStr = formatDate(date);
                      const isToday = dateStr === todayStr;
                      return (
                        <th
                          key={dateStr}
                          className={cn(
                            "px-2 py-3 text-center text-xs font-medium min-w-[44px]",
                            isToday ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          <div>{date.getDate()}</div>
                          <div className="text-[10px] opacity-60">
                            {date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}
                          </div>
                        </th>
                      );
                    })}
                    <th className="sticky right-0 z-10 bg-muted/50 backdrop-blur-sm px-4 py-3 text-center text-sm font-medium text-muted-foreground min-w-[100px]">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {habitIds.map((habitId, index) => {
                    const habit = habits[habitId];
                    const percentage = getCompletionPercentage(habitId);
                    const streak = calculateStreak(habit.completedDates, today);

                    return (
                      <tr
                        key={habitId}
                        className={cn(
                          "border-b border-border/50 hover:bg-muted/20 transition-colors",
                          index % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                        )}
                      >
                        {/* Habit Name */}
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
                        {datesInView.map((date) => {
                          const dateStr = formatDate(date);
                          const isCompleted = habit.completedDates.includes(dateStr);
                          const isToday = dateStr === todayStr;
                          const isFuture = date > today;

                          return (
                            <td key={dateStr} className="px-2 py-2 text-center">
                              <button
                                onClick={() => toggleDate(habitId, dateStr)}
                                disabled={isFuture}
                                className={cn(
                                  "w-7 h-7 rounded-lg border-2 transition-all duration-200 flex items-center justify-center mx-auto",
                                  isCompleted
                                    ? "bg-primary border-primary text-primary-foreground shadow-glow animate-check-bounce"
                                    : isFuture
                                    ? "border-border/30 bg-muted/20 cursor-not-allowed"
                                    : "border-border hover:border-primary/50 hover:bg-primary/5",
                                  isToday && !isCompleted && "border-primary/50 ring-2 ring-primary/20"
                                )}
                              >
                                {isCompleted && <Check className="w-4 h-4" />}
                              </button>
                            </td>
                          );
                        })}

                        {/* Progress */}
                        <td className="sticky right-0 z-10 bg-card backdrop-blur-sm px-4 py-3">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                percentage >= 80
                                  ? "text-success"
                                  : percentage >= 50
                                  ? "text-warning"
                                  : "text-muted-foreground"
                              )}
                            >
                              {percentage}%
                            </span>
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  background:
                                    percentage >= 80
                                      ? "hsl(var(--success))"
                                      : percentage >= 50
                                      ? "hsl(var(--warning))"
                                      : "hsl(var(--muted-foreground))",
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
        ) : habitIds.length === 0 ? (
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
        ) : null}

        {/* Summary */}
        {habitIds.length > 0 && (
          <div className="mt-8 bg-card rounded-xl p-6 shadow-card border border-border animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-4">Habit Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habitIds.map((habitId) => {
                const habit = habits[habitId];
                const percentage = getCompletionPercentage(habitId);
                const streak = calculateStreak(habit.completedDates, today);
                const totalCompleted = habit.completedDates.length;

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
                            background:
                              percentage >= 80
                                ? "hsl(var(--success))"
                                : percentage >= 50
                                ? "hsl(var(--warning))"
                                : "hsl(var(--muted-foreground))",
                          }}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-semibold min-w-[3rem] text-right",
                          percentage >= 80
                            ? "text-success"
                            : percentage >= 50
                            ? "text-warning"
                            : "text-muted-foreground"
                        )}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {totalCompleted} total check-ins since start
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
