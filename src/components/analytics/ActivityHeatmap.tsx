import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { generateHeatmapData, getMonthLabels, formatHeatmapDate, HeatmapDay } from '../../lib/heatmap';

const LEVEL_COLORS = [
  'bg-surface-highlight',
  'bg-accent/20',
  'bg-accent/40',
  'bg-accent/60',
  'bg-accent',
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ActivityHeatmapProps {
  timestamps: number[];
  weeksBack?: number;
}

export default function ActivityHeatmap({ timestamps, weeksBack = 26 }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const days = useMemo(() => generateHeatmapData(timestamps, weeksBack), [timestamps, weeksBack]);
  const monthLabels = useMemo(() => getMonthLabels(days), [days]);

  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const totalBumps = timestamps.length;
  const activeDays = days.filter(d => d.count > 0).length;
  const maxStreak = useMemo(() => {
    let max = 0;
    let current = 0;
    days.forEach(d => {
      if (d.count > 0) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
    });
    return max;
  }, [days]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-semibold">Activity Heatmap</h3>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span>{totalBumps} total bumps</span>
          <span>{activeDays} active days</span>
          <span>{maxStreak} day streak</span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2" onMouseMove={handleMouseMove}>
        <div className="flex flex-col gap-1 mr-2 pt-6">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="text-[10px] text-muted h-3 flex items-center">
              {i % 2 === 0 ? label : ''}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: weekIndex * 0.005 + dayIndex * 0.001 }}
                  className={`
                    w-3 h-3 rounded-sm cursor-pointer transition-all duration-200
                    ${LEVEL_COLORS[day.level]}
                    ${day.count > 0 ? 'hover:ring-1 hover:ring-accent/50' : ''}
                  `}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 text-[10px] text-muted">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div key={level} className={`w-3 h-3 rounded-sm ${LEVEL_COLORS[level]}`} />
        ))}
        <span>More</span>
      </div>

      {hoveredDay && (
        <div
          className="fixed z-50 bg-surface border border-border rounded-lg px-3 py-2 shadow-xl pointer-events-none"
          style={{ left: mousePos.x + 12, top: mousePos.y - 40 }}
        >
          <p className="text-xs font-medium">{formatHeatmapDate(hoveredDay.date)}</p>
          <p className="text-[10px] text-muted">
            {hoveredDay.count === 0 ? 'No bumps' : `${hoveredDay.count} bump${hoveredDay.count !== 1 ? 's' : ''}`}
          </p>
        </div>
      )}
    </div>
  );
}
