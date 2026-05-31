export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function generateHeatmapData(
  timestamps: number[],
  weeksBack: number = 26
): HeatmapDay[] {
  const now = new Date();
  const days: HeatmapDay[] = [];

  // Generate all days for the past N weeks
  const totalDays = weeksBack * 7;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - totalDays);

  // Count bumps per day
  const countMap = new Map<string, number>();
  timestamps.forEach((ts) => {
    const d = new Date(ts);
    const key = d.toISOString().split('T')[0];
    countMap.set(key, (countMap.get(key) || 0) + 1);
  });

  // Fill all days
  for (let i = 0; i <= totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    const count = countMap.get(key) || 0;

    // Determine intensity level (0-4)
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 20) level = 4;
    else if (count >= 10) level = 3;
    else if (count >= 5) level = 2;
    else if (count >= 1) level = 1;

    days.push({ date: key, count, level });
  }

  return days;
}

export function getMonthLabels(days: HeatmapDay[]): { index: number; label: string }[] {
  const labels: { index: number; label: string }[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let lastMonth = -1;
  days.forEach((day, index) => {
    const d = new Date(day.date);
    const month = d.getMonth();
    if (month !== lastMonth) {
      labels.push({ index, label: monthNames[month] });
      lastMonth = month;
    }
  });

  return labels;
}

export function formatHeatmapDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
