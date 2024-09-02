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

type IProbablity = { label: string, score: number };
type IProbablities = IProbablity[];

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

  const CustomLabel = (props) => {
    const { x, y, value } = props;
    return (
      <text x={x} y={y} dy={-3} textAnchor="start" fill="#000">
        {value}
      </text>
    );
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart
        accessibilityLayer
        data={probablities}
        layout="vertical"
        margin={{ top: 20, left: 10, right: 25 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" dataKey="score"/>
        <YAxis type="category" hide />
        <Bar dataKey="score" fill="var(--color-desktop)" barSize={20}>
          <LabelList dataKey="score" position="right" fill="black"
            formatter={(value) => round(value, 2)}
          />
          <LabelList dataKey="label" position="bottom" content={CustomLabel} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
