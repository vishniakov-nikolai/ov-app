import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts';

import { ChartContainer, type ChartConfig } from './ui/chart';
import { round } from '../lib/utils';

type IProbablities = { label: string, score: number }[];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
} satisfies ChartConfig;

interface IDistributionGraph {
  probablities: IProbablities,
};

export default function DistributionGraph(props: IDistributionGraph) {
  const { probablities } = props;

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={probablities} layout="vertical" margin={{ left: 100, right: 15 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number"/>
        <YAxis type="category" dataKey="label" axisLine={false}
          tickLine={false}
          tickFormatter={(value) => {
            return value;
          }}
        />
        <Bar dataKey="score" fill="var(--color-desktop)">
          <LabelList dataKey="score" position="right" fill="black"
            formatter={(value) => round(value, 2)}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
