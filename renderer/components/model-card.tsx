import { Cross2Icon, ExternalLinkIcon, StarIcon } from '@radix-ui/react-icons'
import Link from 'next/link';

type ModelCardProps = {
  name: string,
  isDefault?: boolean,
  isLocal?: boolean,
  onSelect: (modelName) => void,
  onRemove?: (modelName) => void,
};
export function ModelCard({ name, isDefault, isLocal, onSelect, onRemove }: ModelCardProps) {
  return <div className="border p-4 hover:border-primary hover:shadow-sm">
    <div className="flex mb-4 text-gray-400">
      <StarIcon className="cursor-pointer hover:text-orange-300" />
      <Link href={getHFLink(name)} target="_blank" className="text-inherit hover:text-primary">
        <ExternalLinkIcon />
      </Link>
      { !isDefault &&
        <Cross2Icon className="cursor-pointer ml-auto hover:text-red-500"
          onClick={() => { onRemove && onRemove(name); } }
        />
      }
    </div>
    <h3 className="truncate cursor-pointer hover:text-primary" onClick={() => onSelect(name)}>{name}</h3>
  </div>;
}

function getHFLink(modelName) {
  return `https://huggingface.co/${modelName}`;
}
