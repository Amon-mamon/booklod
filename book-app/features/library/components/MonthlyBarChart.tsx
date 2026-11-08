"use client";
import { C } from "../../../app/components/theme";



export function niceMax(n: number) {
  if (n <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const norm = n / pow;
  let step;
  if (norm <= 2) step = 2;
  else if (norm <= 5) step = 5;
  else step = 10;
  return Math.ceil(n / (step * pow)) * step * pow;
}


interface MonthlyBarChartProps {
  monthLabels: string[];
  finishedCounts: number[];
  readingCounts: number[];
}

export function MonthlyBarChart({
  monthLabels,
  finishedCounts,
  readingCounts,
}: MonthlyBarChartProps) {
  const rawMax = Math.max(...finishedCounts, ...readingCounts, 0);
  const top = niceMax(rawMax);
  const tickCount = Math.min(5, top);
  const step = top / tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round(step * i));
  const chartHeight = 160;
  const axisWidth = 22;

  return (
    <div>
      <div className="flex" style={{ height: chartHeight }}>
        <div
          className="flex flex-col-reverse justify-between text-right pr-1.5 flex-shrink-0"
          style={{ width: axisWidth, height: chartHeight }}
        >
          {ticks.map((t) => (
            <span key={t} className="text-[10px] leading-none" style={{ color: C.muted }}>
              {t}
            </span>
          ))}
        </div>
        <div className="flex-1 relative" style={{ height: chartHeight }}>
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-t border-dashed"
              style={{ bottom: `${(t / top) * 100}%`, borderColor: C.tan }}
            />
          ))}
          <div className="absolute inset-0 flex items-end justify-between">
            {monthLabels.map((_, i) => (
              <div key={i} className="flex-1 h-full flex items-end justify-center gap-[3px]">
                <div
                  className="rounded-t-sm"
                  style={{
                    width: 6,
                    height: `${(finishedCounts[i] / top) * 100}%`,
                    background: finishedCounts[i] > 0 ? C.orange : "transparent",
                  }}
                  title={`${finishedCounts[i]} finished`}
                />
                <div
                  className="rounded-t-sm"
                  style={{
                    width: 6,
                    height: `${(readingCounts[i] / top) * 100}%`,
                    background: readingCounts[i] > 0 ? C.green : "transparent",
                  }}
                  title={`${readingCounts[i]} reading`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex mt-1.5" style={{ marginLeft: axisWidth }}>
        {monthLabels.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center">
            <span className="text-[10px] font-medium" style={{ color: C.navy }}>{label}</span>
            <span className="text-[9px]" style={{ color: "#B0AA9C" }}>{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
