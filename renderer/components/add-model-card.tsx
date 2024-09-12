import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { BE, UI } from '../../constants';

const formSchema = z.object({
  task: z.string().min(1),
  name: z.string().min(2, 'Specify model name that model has on huggingface'),
  files: z.string().min(1, 'Specify filename or several divided by comma'),
})

type AddModelCardProps = {
  task: string,
};
export function AddModelCard({ task }: AddModelCardProps) {
  const [open, setOpen] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return window.ipc.on(UI.END.SAVE_MODEL, (status: { ok: boolean, message: string }) => {
      setIsLoading(false);

      if (!status.ok) return setFormErrorMessage(status.message);

      setOpen(false);
      window.ipc.send(BE.START.LOAD_MODELS_LIST);
      form.reset({ name: '', files: '' });
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: task || 'image-classification',
      name: '',
      files: '',
    }
  });
  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    setIsLoading(true);
    window.ipc.send(BE.START.SAVE_MODEL, {
      task: data.task,
      modelName: data.name,
      files: data.files.split(','),
    });
  };


  useEffect(() => {
    if (open) return;

    setFormErrorMessage('');
    form.clearErrors();
  }, [open, form]);

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <div className="transition-all cursor-pointer border border-dashed border-gray-400 p-4 hover:border-primary flex items-center text-gray-400 hover:text-primary justify-center bg-[--slightly-white] hover:bg-[--slightly-white-hover]">
        <div>
          <div className="w-full text-center text-xl">+</div>
          <div>Add New Model</div>
        </div>
      </div>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="font-medium text-xl">Add Model</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={(e) => {
          setFormErrorMessage('');
          form.handleSubmit(onSubmit)(e);
        }}>
        <div className="grid gap-2">
          { formErrorMessage &&
            <p className="text-destructive pb-2 text-ellipsis max-w-full overflow-hidden"
              title={formErrorMessage}
            >
              {formErrorMessage}
            </p>
          }
          <FormField
            control={form.control}
            name="task"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={task}
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select Task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image-classification">Image Classification</SelectItem>
                      <SelectItem value="image-segmentation">Image Segmentation</SelectItem>
                      <SelectItem value="object-detection">Object Detection</SelectItem>
                      <SelectItem value="text-generation">Text Generation</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HF Name</FormLabel>
                <FormControl>
                  <Input { ...field }/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Files</FormLabel>
                <FormControl>
                  <Input
                    placeholder="openvino_model.xml, openvino_model.bin"
                    className="col-span-2"
                    { ...field }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-2">
            <Button type="submit" disabled={isLoading}>Save</Button>
          </div>
        </div>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
}
