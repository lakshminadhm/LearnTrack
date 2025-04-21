import { Log, Streak, Progress, TechBreakdown } from '../../../shared/src/types';

// Calculate current and longest streaks
export const calculateStreaks = (dates: string[]): Streak => {
  if (!dates || dates.length === 0) {
    return {
      current: 0,
      longest: 0,
      dates: []
    };
  }

  // Sort dates in descending order (newest first)
  const sortedDates = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  // Remove duplicates (in case multiple logs on same day)
  const uniqueDates = [...new Set(sortedDates.map(date => date.split('T')[0]))];
  
  let current = 0;
  let longest = 0;
  let currentStreak: string[] = [];
  
  // Calculate current streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let checkDate = today;
  let streakBroken = false;
  
  // Check if there's a log for today
  const todayFormatted = today.toISOString().split('T')[0];
  const hasTodayLog = uniqueDates.includes(todayFormatted);
  
  if (hasTodayLog) {
    current = 1;
    currentStreak.push(todayFormatted);
    checkDate = yesterday;
  } else {
    // If no log for today, see if there's one for yesterday to continue the streak
    const yesterdayFormatted = yesterday.toISOString().split('T')[0];
    
    if (!uniqueDates.includes(yesterdayFormatted)) {
      // No log for yesterday, streak is broken
      streakBroken = true;
    } else {
      checkDate = yesterday;
      current = 1;
      currentStreak.push(yesterdayFormatted);
    }
  }
  
  // Continue checking previous days
  if (!streakBroken) {
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const checkDateFormatted = checkDate.toISOString().split('T')[0];
      
      if (uniqueDates.includes(checkDateFormatted)) {
        current++;
        currentStreak.push(checkDateFormatted);
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  let tempStreak = 1;
  let tempLongest = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const prevDate = new Date(uniqueDates[i - 1]);
    
    const diffDays = Math.round((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
      tempLongest = Math.max(tempLongest, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  
  longest = Math.max(current, tempLongest);
  
  return {
    current: streakBroken ? 0 : current,
    longest,
    dates: currentStreak
  };
};

// Calculate progress metrics
export const calculateProgress = (logs: Log[]): Progress => {
  if (!logs || logs.length === 0) {
    return {
      total_hours: 0,
      total_logs: 0,
      recent_logs: []
    };
  }
  
  // Calculate total hours
  const totalHours = logs.reduce((sum, log) => sum + log.hours_spent, 0);
  
  // Get recent logs (last 5)
  const recentLogs = logs.slice(0, 5);
  
  return {
    total_hours: totalHours,
    total_logs: logs.length,
    recent_logs: recentLogs
  };
};

// Calculate technology breakdown
export const calculateTechBreakdown = (logs: any[]): TechBreakdown[] => {
  if (!logs || logs.length === 0) {
    return [];
  }
  
  // Group by technology and sum hours
  const techMap: Record<string, number> = {};
  
  logs.forEach(log => {
    const tech = log.technology;
    const hours = log.hours_spent;
    
    techMap[tech] = (techMap[tech] || 0) + hours;
  });
  
  // Calculate total hours
  const totalHours = Object.values(techMap).reduce((sum, hours) => sum + hours, 0);
  
  // Create array of tech breakdown objects
  const techBreakdown: TechBreakdown[] = Object.entries(techMap).map(([technology, hours]) => ({
    technology,
    hours,
    percentage: (hours / totalHours) * 100
  }));
  
  // Sort by hours (descending)
  return techBreakdown.sort((a, b) => b.hours - a.hours);
};