import Head from 'next/head';
import React from 'react';

export default function ErrorWindow() {
  return (
    <React.Fragment>
      <Head>
        <title>OpenVINO App | Error on Sample open</title>
      </Head>
      <div className="flex flex-col flex-nowrap h-full items-center">
        <div className="flex items-center p-8">
          <div className="text-destructive w-8 h-8 mr-2">
            <svg className="w-full h-full" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
          </div>
          <span>Cannot open model</span>
        </div>
        <p>Explanation</p>
      </div>
    </React.Fragment>);
}
