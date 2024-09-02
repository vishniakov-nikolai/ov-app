import { IModelConfig } from '../../globals/types';
import { groupBy } from '../lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Cross2Icon, StarIcon } from '@radix-ui/react-icons'

type ModelListProps = {
  models: IModelConfig[],
  onSelect: (modelName: string) => void,
  onAdd: (name: string, task: string, files: string) => void,
  onRemove?: (name: string) => void,
};
export default function ModelsList({ models, onSelect, onAdd, onRemove }: ModelListProps) {
  const groupped = groupBy(models, 'task');
  const categories = Object.keys(groupped);

  return (<div className="grow overflow-auto">
    { !categories.length && 'Models List is empty' }
    { categories.map((category, idx) =>
      <div key={idx}>
        <h2 className='p-4 pb-0 font-medium'>{category}</h2>
        <div className="p-4 grid grid-cols-3 gap-2">
          { groupped[category].map((m, j) =>
            <ModelCard key={j} name={m.name} isDefault={m.default} onSelect={onSelect} onRemove={onRemove} />)
          }
          <AddModelCard task={category} onClick={onAdd} />
        </div>
      </div>)
    }
  </div>);
}

type ModelCardProps = {
  name: string,
  isDefault?: boolean,
  isLocal?: boolean,
  onSelect: (modelName) => void,
  onRemove?: (modelName) => void,
};
function ModelCard({ name, isDefault, isLocal, onSelect, onRemove }: ModelCardProps) {
  return <div className="border p-4 hover:border-primary hover:shadow-sm">
    <div className="flex mb-4 text-gray-400">
      <StarIcon className="cursor-pointer" />
      { !isDefault &&
        <Cross2Icon className="cursor-pointer ml-auto hover:text-red-500"
          onClick={() => { onRemove && onRemove(name); } }
        />
      }
    </div>
    <h3 className="truncate cursor-pointer hover:text-primary" onClick={() => onSelect(name)}>{name}</h3>
  </div>;
}

type AddModelCardProps = {
  task: string,
  onClick: (name: string, task: string, files: string) => void,
};
function AddModelCard({ task, onClick }: AddModelCardProps) {
  const [name, setName] = useState('');
  const [files, setFiles] = useState('');
  const [localTask, setTask] = useState(task);
  const [open, setOpen] = useState(false);

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <div className="cursor-pointer border border-dashed p-4 hover:border-primary flex items-center text-gray-400 hover:text-primary">
        <div className="w-full text-center text-xl">+</div>
      </div>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Model</DialogTitle>
        <DialogDescription>
          Please, fill all fields
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="width">Task</Label>
            <Select
              defaultValue={task}
              onValueChange={setTask}
              disabled
            >
              <SelectTrigger
                className="col-span-2 h-8"
              >
                <SelectValue placeholder="Select Task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image-classification">Image Classification</SelectItem>
                <SelectItem value="image-segmentation">Image Segmentation</SelectItem>
                <SelectItem value="object-detection">Object Detection</SelectItem>
                <SelectItem value="text-generation">Text Generation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="maxWidth">HF Name</Label>
            <Input
              id="name"
              className="col-span-2 h-8"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="files">Files</Label>
            <Input
              id="files"
              placeholder="openvino_model.xml, openvino_model.bin"
              className="col-span-2 h-8"
              value={files}
              onChange={(e) => setFiles(e.target.value)}
              required
            />
          </div>
        </div>
      <DialogFooter className="sm:justify-start">
        <Button
          onClick={() => {
            onClick(name, localTask, files);
            setOpen(false);
          }}
        >Add Model</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}
