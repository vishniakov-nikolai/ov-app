import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { createWriteStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { HttpsProxyAgent } from 'https-proxy-agent';

export * from './create-window';

export async function downloadFile(url, filename, destination) {
  console.log({ url, filename, destination });

  const { env } = process;
  const timeout = 5000;

  await applyFolderPath(destination);

  const fullPath = path.resolve(destination, filename);
  const file = createWriteStream(fullPath);
  const protocolString = new URL(url).protocol === 'https:' ? 'https' : 'http';
  const module = {
    http,
    https,
  }[protocolString];
  const proxyUrl = env.http_proxy || env.HTTP_PROXY || env.npm_config_proxy;

  let agent;

  if (proxyUrl) {
    agent = new HttpsProxyAgent(proxyUrl);
    console.log(`Proxy agent configured using: '${proxyUrl}'`);
  }

  return new Promise((resolve, reject) => {
    file.on('error', e => {
      reject(`Error oppening file stream: ${e}`);
    });

    const getRequest = module.get(url, { agent }, res => {
      const { statusCode } = res;

      if (statusCode !== 200)
        return reject(`Server returns status code: ${statusCode}`);

      res.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`File successfully stored at '${fullPath}'`);
        resolve(fullPath);
      });
    });

    getRequest.on('error', e => {
      reject(`Error sending request: ${e}`);
    });

    getRequest.setTimeout(timeout, () => {
      getRequest.destroy();
      reject(`Request timed out after ${timeout}`);
    });
  });
}

async function applyFolderPath(dirPath) {
  try {
    await stat(dirPath);

    return;
  } catch(err) {
    if (err.code !== 'ENOENT') throw err;

    await mkdir(dirPath, { recursive: true });
  }
}
