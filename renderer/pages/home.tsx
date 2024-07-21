import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Editor from '@monaco-editor/react';

export default function HomePage() {
  const [message, setMessage] = React.useState('No message found');
  const codeSample = `// Add openvino-node package
const { ov: addon } = require('openvino-node');`;

  React.useEffect(() => {
    window.ipc.on('message', (message: string) => {
      setMessage(message)
    })
  }, [])

  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (basic-lang-typescript)</title>
      </Head>
      <div>
        <p>
          ⚡ Electron + Next.js ⚡ -<Link href="/next">Go to next page</Link>
        </p>
        <Image
          src="/images/logo.png"
          alt="Logo image"
          width={256}
          height={256}
        />
      </div>
      <div>
        <button
          onClick={() => {
            window.ipc.send('message', 'Hello')
          }}
        >
          Test IPC
        </button>
        <p>{message}</p>
        <Editor height="90vh" defaultLanguage="javascript" defaultValue={codeSample} />;
      </div>
    </React.Fragment>
  )
}
