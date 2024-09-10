import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { UpdateIcon } from '@radix-ui/react-icons';
import { useSearchParams } from 'next/navigation'

import Footer from '../components/footer';
import { Button } from '../components/ui/button';
import DeviceSelector from '../components/device-selector';
import { BE, UI } from '../../constants';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Header } from '../components/header';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';

const DEFAULT_DEVICE = 'AUTO';

export default function TextGenerationPage() {
  const searchParams = useSearchParams()
  const modelName = searchParams.get('model');
  const [input, setInput] = useState('');
  const [isInferenceRunning, setIsInferenceRunning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(DEFAULT_DEVICE);
  const [originalPromt, setOriginalPromt] = useState(null);

  const [temperature, setTemperature] = useState('1');
  const [maxNewTokens, setMaxNewTokens] = useState('');
  const [repetitionPenalty, setRepetitionPenalty] = useState('1');
  const [noRepeatNgramSize, setNoRepeatNgramSize] = useState('0');
  const [numBeams, setNumBeams] = useState('1');
  const [numReturnSequences, setNumReturnSequences] = useState('1');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!modelName || !selectedDevice) return;

    window.ipc.send(BE.START.INIT_MODEL, { modelName, device: selectedDevice });
  }, [modelName, selectedDevice]);

  useEffect(() => {
    return window.ipc.on(UI.START.INFERENCE, () => {
      console.log('=== Inference running...');
      setIsInferenceRunning(true);
    });
  }, []);
  useEffect(() => {
    return window.ipc.on(UI.START.NEW_CHUNK, (txt: string) => {
      setInput(txt);
    });
  }, []);
  useEffect(() => {
    return window.ipc.on(UI.END.INFERENCE, (inferenceResult:
      {
        data?: { 'generated_text': string }[],
        elapsedTime: BigInt,
      }) => {
        console.log(inferenceResult);

        setIsInferenceRunning(false);
        setInput(extractText(inferenceResult.data));

        console.log('=== Inference done');
      }
    );
  }, []);
  useEffect(() => {
    return window.ipc.on(UI.EXCEPTION, (errorMessage: string) => {
      setIsInferenceRunning(false);
      setErrorMessage(errorMessage);
      setShowError(true);
    });
  }, []);
  useEffect(() => {
    setInput('');
  }, [selectedDevice]);

  function initiateInference(text) {
    const config: {
      'temperature': string,
      'max_new_tokens': string,
      'repetition_penalty': string,
      'no_repeat_ngram_size': string,
      'num_beams': string,
      'num_return_sequences': string,
    } = {
      'temperature': temperature,
      'max_new_tokens': maxNewTokens,
      'repetition_penalty': repetitionPenalty,
      'no_repeat_ngram_size': noRepeatNgramSize,
      'num_beams': numBeams,
      'num_return_sequences': numReturnSequences,
    };
    const filteredConfig = Object.keys(config).reduce((acc, key) => {
      const value = config[key];

      if (value !== '' && !isNaN(Number(value))) acc[key] = Number(value);

      return acc;
    }, {});

    setOriginalPromt(text);

    window.ipc.send(BE.START.OV.INFERENCE, {
      value: text,
      config: filteredConfig,
    });
  }

  return (
    <React.Fragment>
      <Head>
        <title>{`OpenVINO App | Text Generation | ${modelName}`}</title>
      </Head>
      <div className="content w-auto">
        <Header section="Text Generation Sample" />
        <div className="flex flex-col grow p-4 pt-2">
          <fieldset disabled={isInferenceRunning}>
            <ul className="leading-10 mb-3">
              <li className="flex mb-2">
                <span className="mr-2 w-[60px]">Model:</span>
                {modelName}
              </li>
              <li className="flex mb-3">
                <span className="mr-2 w-[60px]">Device:</span>
                <DeviceSelector
                  setSelectedDevice={setSelectedDevice}
                />
              </li>
            </ul>

            <div className="mb-5">
              <Button
                onClick={() => initiateInference(input)}
                className="mr-2"
                disabled={!input?.length}
              >Generate</Button>
            </div>
          </fieldset>
          <div className="flex min-h-80">
            <textarea
              className="border border-black w-1/2 p-4 resize-none"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Put your promt here..."
            ></textarea>
            <div className="w-1/2 grid gap-2 items-start p-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  className="col-span-2 h-8"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  type="number"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxNewTokens">Max New Tokens</Label>
                <Input
                  id="maxNewTokens"
                  className="col-span-2 h-8"
                  value={maxNewTokens}
                  placeholder="null"
                  onChange={(e) => setMaxNewTokens(e.target.value)}
                  type="number"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="repetitionPenalty">Repetition Penalty</Label>
                <Input
                  id="repetitionPenalty"
                  className="col-span-2 h-8"
                  value={repetitionPenalty}
                  min={1}
                  step={0.1}
                  onChange={(e) => setRepetitionPenalty(e.target.value)}
                  type="number"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="noRepeatNgramSize">No Repeat Ngram Size</Label>
                <Input
                  id="noRepeatNgramSize"
                  className="col-span-2 h-8"
                  value={noRepeatNgramSize}
                  min={0}
                  step={1}
                  onChange={(e) => setNoRepeatNgramSize(e.target.value)}
                  type="number"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="numBeams">Num Beams</Label>
                <Input
                  id="numBeams"
                  className="col-span-2 h-8"
                  value={numBeams}
                  min={1}
                  step={0.1}
                  onChange={(e) => setNumBeams(e.target.value)}
                  type="number"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="numReturnSequences">Num Return Sequences</Label>
                <Input
                  id="numReturnSequences"
                  className="col-span-2 h-8"
                  value={numReturnSequences}
                  min={1}
                  step={0.1}
                  onChange={(e) => setNumReturnSequences(e.target.value)}
                  type="number"
                />
              </div>
            </div>
          </div>
          { originalPromt && <>
              <h3 className="font-medium pt-4">
                Original Promt (
                  <span
                    className="text-primary cursor-pointer hover:text-primary/90"
                    onClick={() => setInput(originalPromt)}>
                    Set as Input
                  </span>):
              </h3>
              <div className="py-2 whitespace-pre-line">{originalPromt}</div>
            </> }
        </div>
        <Footer className="mt-auto" />
        <AlertDialog open={showError} onOpenChange={setShowError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <div className="text-destructive w-8 h-8 mr-2">
                  <svg className="w-full h-full" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
                </div>
                <span>Something went wrong</span>
              </AlertDialogTitle>
              <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Ok</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>

    </React.Fragment>
  )
}

function extractText(arr?: { 'generated_text': string }[], idx = 0): string {
  if (!arr) return '';

  return arr[idx]['generated_text'];
}
