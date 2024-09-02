import { IModelConfig } from '../../globals/types';
import { groupBy } from '../lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Cross2Icon, StarIcon, ImageIcon } from '@radix-ui/react-icons'

const categoriesMap = {
  'image-classification': <>
      <span className="mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" focusable="false" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32"><polygon points="4 20 4 22 8.586 22 2 28.586 3.414 30 10 23.414 10 28 12 28 12 20 4 20"></polygon><path d="M19,14a3,3,0,1,0-3-3A3,3,0,0,0,19,14Zm0-4a1,1,0,1,1-1,1A1,1,0,0,1,19,10Z"></path><path d="M26,4H6A2,2,0,0,0,4,6V16H6V6H26V21.17l-3.59-3.59a2,2,0,0,0-2.82,0L18,19.17,11.8308,13l-1.4151,1.4155L14,18l2.59,2.59a2,2,0,0,0,2.82,0L21,19l5,5v2H16v2H26a2,2,0,0,0,2-2V6A2,2,0,0,0,26,4Z"></path></svg>
      </span>
      <span>Image Classification</span>
    </>,
  'image-segmentation': <>
      <span className="mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" focusable="false" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32"><path d="M30,3.4141,28.5859,2,2,28.5859,3.4141,30l2-2H26a2.0027,2.0027,0,0,0,2-2V5.4141ZM26,26H7.4141l7.7929-7.793,2.3788,2.3787a2,2,0,0,0,2.8284,0L22,19l4,3.9973Zm0-5.8318-2.5858-2.5859a2,2,0,0,0-2.8284,0L19,19.1682l-2.377-2.3771L26,7.4141Z"></path><path d="M6,22V19l5-4.9966,1.3733,1.3733,1.4159-1.416-1.375-1.375a2,2,0,0,0-2.8284,0L6,16.1716V6H22V4H6A2.002,2.002,0,0,0,4,6V22Z"></path></svg>
      </span>
      <span>Image Segmentation</span>
    </>,
  'object-detection': <>
      <span className="mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" focusable="false" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32"><path d="M24,14a5.99,5.99,0,0,0-4.885,9.4712L14,28.5859,15.4141,30l5.1147-5.1147A5.9971,5.9971,0,1,0,24,14Zm0,10a4,4,0,1,1,4-4A4.0045,4.0045,0,0,1,24,24Z"></path><path d="M17,12a3,3,0,1,0-3-3A3.0033,3.0033,0,0,0,17,12Zm0-4a1,1,0,1,1-1,1A1.0009,1.0009,0,0,1,17,8Z"></path><path d="M12,24H4V17.9966L9,13l5.5859,5.5859L16,17.168l-5.5859-5.5855a2,2,0,0,0-2.8282,0L4,15.168V4H24v6h2V4a2.0023,2.0023,0,0,0-2-2H4A2.002,2.002,0,0,0,2,4V24a2.0023,2.0023,0,0,0,2,2h8Z"></path></svg>
      </span>
      <span>Object Detection</span>
    </>,
  'text-generation': <>
      <span className="mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" focusable="false" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 18 18"><path d="M16.2607 8.08202L14.468 6.28928C14.3063 6.12804 14.0873 6.03749 13.859 6.03749C13.6307 6.03749 13.4117 6.12804 13.25 6.28928L5.6375 13.904V16.9125H8.64607L16.2607 9.30002C16.422 9.13836 16.5125 8.91935 16.5125 8.69102C16.5125 8.4627 16.422 8.24369 16.2607 8.08202V8.08202ZM8.1953 15.825H6.725V14.3547L11.858 9.22118L13.3288 10.6915L8.1953 15.825ZM14.0982 9.92262L12.6279 8.45232L13.8606 7.21964L15.3309 8.68994L14.0982 9.92262Z"></path><path d="M6.18125 9.84373H7.26875V6.03748H8.9V4.94998H4.55V6.03748H6.18125V9.84373Z"></path><path d="M4.55 11.475H2.375V2.775H11.075V4.95H12.1625V2.775C12.1625 2.48658 12.0479 2.20997 11.844 2.00602C11.64 1.80208 11.3634 1.6875 11.075 1.6875H2.375C2.08658 1.6875 1.80997 1.80208 1.60602 2.00602C1.40207 2.20997 1.2875 2.48658 1.2875 2.775V11.475C1.2875 11.7634 1.40207 12.04 1.60602 12.244C1.80997 12.4479 2.08658 12.5625 2.375 12.5625H4.55V11.475Z"></path></svg>
      </span>
      <span>Text Generation</span>
    </>,
}

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
        <h2 className='p-4 pb-0 font-medium flex items-center'>{categoriesMap[category] || category}</h2>
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
