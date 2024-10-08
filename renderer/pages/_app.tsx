import '../globals.css';
import { AppContextProvider } from '../providers/app-context';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  return <AppContextProvider><Component {...pageProps} /></AppContextProvider>;
}
