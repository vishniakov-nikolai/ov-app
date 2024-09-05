import { useEffect, useRef, useState } from 'react';
import { IDetectionResult } from '../../globals/types';
import { round } from '../lib/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';

type DetectionListProps = {
  items: IDetectionResult[],
  filtered: IDetectionResult[],
  setFiltered: (items: IDetectionResult[]) => void,
  setHovered: (items: IDetectionResult) => void,
};
export function DetectionsList(props: DetectionListProps) {
  const { items, filtered, setFiltered, setHovered } = props;
  const [threshold, setThreshold] = useState<number>(0);
  const listRef = useRef(null);

  useEffect(() => {
    const filtered = items.filter(i => i.score >= threshold);

    setFiltered(filtered);
  }, [threshold, setFiltered]);

  return <div className="flex flex-col w-full h-full">
    <div className="grid w-full max-w-sm items-center gap-1.5 pb-4">
      <Label htmlFor="threshold">Threshold</Label>
      <Input type="number" id="threshold" placeholder="Threshold"
        min="0"
        step="0.1"
        max="1"
        value={threshold}
        onChange={(e) => {
          const num = Number(e.target.value);

          setThreshold(num > 1 ? 1 : num);
        }}
      />
    </div>
    <h3>Predictions</h3>
    <div className="grow max-h-full overflow-auto relative border border-black">
      <ul ref={listRef} className="absolute w-full h-full overflow-auto">
        {
          (filtered || []).sort((i, j) => i.score > j.score ? -1 : 1).map((i, idx) => {
            return <li key={idx}
              onClick={() => setHovered(filtered[idx])}
              className="px-1 py-1/2 hover:bg-primary/50 border-b cursor-pointer"
            >{i.label} ({round(i.score, 3)})</li>
          })
        }
      </ul>
    </div>
  </div>
}


