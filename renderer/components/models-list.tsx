import { PredefinedModelConfig } from '../../globals/types';
import { groupBy } from '../lib/utils';
import { Button } from './ui/button';

type ModelListProps = {
  models: PredefinedModelConfig[],
  onSelect: (modelName) => void,
};
export default function ModelsList({ models, onSelect }: ModelListProps) {
  const groupped = groupBy(models, 'task');
  const categories = Object.keys(groupped);

  return (<div className="grow overflow-auto">
    { !categories.length && 'Models List is empty' }
    { categories.map((category, idx) =>
      <div key={idx}>
        <h2 className='p-4 pb-0 font-medium'>{category}</h2>
        <div className="p-4 grid grid-cols-3 gap-2">
          { groupped[category].map(({ name }, j) =>
            <ModelCard key={j} name={name} onSelect={onSelect} />)
          }
        </div>
      </div>)
    }
  </div>);
}

type ModelCardProps = {
  name: string,
  isFav?: boolean,
  isLocal?: boolean,
  onSelect: (modelName) => void,
};
function ModelCard({ name, isFav, isLocal, onSelect }: ModelCardProps) {
  return <div className="border p-4">
    <h3 className="truncate" onClick={() => onSelect(name)}>{name}</h3>
  </div>;
}
