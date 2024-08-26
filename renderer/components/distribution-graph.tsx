import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts';

import { ChartContainer, type ChartConfig } from './ui/chart';

type IProbablities = { classId: number, prediction: number }[];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
} satisfies ChartConfig;

interface IDistributionGraph {
  probablities: IProbablities,
  dictionary?: string[],
};

export default function DistributionGraph(props: IDistributionGraph) {
  const { probablities } = props;
  const dictionary = props.dictionary || {};

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={probablities} layout="vertical" margin={{ left: 100, right: 15 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number"/>
        <YAxis type="category" dataKey="classId" axisLine={false}
          tickLine={false}
          tickFormatter={(value) => {
            const label = dictionary[value];

            return label ? `${label} (${value})` : value;
          }}
        />
        <Bar dataKey="prediction" fill="var(--color-desktop)">
          <LabelList dataKey="prediction" position="right" fill="black"
            formatter={(value) => round(value, 2)}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function round(number, decimalPlaces) {
  const factor = Math.pow(10, decimalPlaces);

  return Math.round(number * factor) / factor;
}
