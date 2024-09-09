import { Cross2Icon, ExternalLinkIcon, StarIcon } from '@radix-ui/react-icons'
import Link from 'next/link';
import { Button } from './ui/button';

type ModelCardProps = {
  name: string,
  isDefault?: boolean,
  isLocal?: boolean,
  onSelect: (modelName) => void,
  onRemove?: (modelName) => void,
};
export function ModelCard({ name, isDefault, isLocal, onSelect, onRemove }: ModelCardProps) {
  const title = `Open ${name} model`;

  return <div className="border p-4 hover:border-primary hover:shadow-sm transition-all">
    <div className="flex mb-4 text-gray-400">
      <div title="Add model to favorites">
        <StarIcon className="cursor-pointer hover:text-orange-300 transition-colors"/>
      </div>
      { !isDefault &&
        <div className="ml-auto flex items-center text-xs cursor-pointer hover:text-red-500 transition-colors"
          onClick={() => { onRemove && onRemove(name); } } title="Remove this model from app">
          <span>Remove</span>
          <Cross2Icon className="ml-1"/>
        </div>
      }
    </div>
    <div className="flex items-center">
      <Link href={getHFLink(name)} target="_blank"
        className="p-0 pr-2 text-gray-400 hover:text-primary transition-colors"
        title={`Open model page at Hugging Face site`}>
        <ExternalLinkIcon />
      </Link>
      <h3 className="truncate cursor-pointer hover:text-primary transition-colors" title={title}
        onClick={() => onSelect(name)}>{name}</h3>
    </div>
    <Button className="mt-4" variant="secondary" size="sm" title={title}
      onClick={() => onSelect(name)}>Open</Button>
  </div>;
}

function getHFLink(modelName) {
  return `https://huggingface.co/${modelName}`;
}
