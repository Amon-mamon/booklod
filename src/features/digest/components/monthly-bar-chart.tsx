import { colors } from "@/config/brand";
import { buildAxis } from "../lib/chart-scale";

interface MonthlyBarChartProps {
  monthLabels: readonly string[];
  finishedCounts: number[];
  readingCounts: number[];
}

const CHART_HEIGHT = 160;
const AXIS_WIDTH = 22;

export function MonthlyBarChart({ monthLabels, finishedCounts, readingCounts }: MonthlyBarChartProps) {
  const { top, ticks } = buildAxis(Math.max(...finishedCounts, ...readingCounts, 0));

  return (
    <div>
      <div className="flex" style={{ height: CHART_HEIGHT }}>
        <div
          className="flex flex-col-reverse justify-between text-right pr-1.5 flex-shrink-0"
          style={{ width: AXIS_WIDTH, height: CHART_HEIGHT }}
        >
          {ticks.map((t) => (
            <span key={t} className="text-[10px] leading-none" style={{ color: colors.muted }}>{t}</span>
          ))}
        </div>
        <div className="flex-1 relative" style={{ height: CHART_HEIGHT }}>
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-t border-dashed"
              style={{ bottom: `${(t / top) * 100}%`, borderColor: colors.tan }}
            />
          ))}
          <div className="absolute inset-0 flex items-end justify-between">
            {monthLabels.map((label, i) => (
              <div key={label} className="flex-1 h-full flex items-end justify-center gap-[3px]">
                <Bar value={finishedCounts[i]} top={top} color={colors.orange} title={`${finishedCounts[i]} finished`} />
                <Bar value={readingCounts[i]} top={top} color={colors.green} title={`${readingCounts[i]} reading`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex mt-1.5" style={{ marginLeft: AXIS_WIDTH }}>
        {monthLabels.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center">
            <span className="text-[10px] font-medium" style={{ color: colors.navy }}>{label}</span>
            <span className="text-[9px]" style={{ color: colors.faint }}>{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ value, top, color, title }: { value: number; top: number; color: string; title: string }) {
  return (
    <div
      className="rounded-t-sm"
      style={{ width: 6, height: `${(value / top) * 100}%`, background: value > 0 ? color : "transparent" }}
      title={title}
    />
  );
}
