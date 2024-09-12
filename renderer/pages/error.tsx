import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { BE, UI } from '../../constants';
import { Button } from '../components/ui/button';

export default function ErrorWindow() {
  const [errorMessage, setErrorMessage] = useState('');
  const [stacktrace, setStackTrace] = useState('');

  useEffect(() => {
    window.ipc.send(BE.START.FETCH_EXCEPTION_INFO);
  }, []);

  useEffect(() => {
    return window.ipc.on(UI.END.FETCH_EXCEPTION_INFO, (error: Error) => {
      console.log(error);
      setErrorMessage(error.message);
      setStackTrace(error.stack);
    });
  }, []);

  function closeWindow() {
    window.ipc.send(BE.CLOSE_ERROR_WINDOW);
  }

  return (
    <React.Fragment>
      <Head>
        <title>OpenVINO App | Error on Open the Sample</title>
      </Head>
      <div className="flex flex-col flex-nowrap h-full items-center p-8">
        <h1 className="flex items-center pb-8 font-medium text-xl">
          <div className="text-destructive w-8 h-8 mr-2">
            <svg className="w-full h-full" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
          </div>
          <span>Cannot open model</span>
        </h1>
        {/* <p className="break-all">{ errorMessage || 'Something went wrong' }</p> */}
        { stacktrace
          ? <p className="break-all mt-6 font-mono">{ stacktrace }</p>
          : 'Something went wrong'
        }
        <Button
          className="mt-8"
          variant="outline"
          onClick={() => closeWindow()}
        >Close Window</Button>
      </div>
    </React.Fragment>);
}
