import {hydrateRoot} from 'react-dom/client';
import App from './App';
import '../../app/globals.css';
import '../../app/fonts.css';
import '../../app/marketing.css';
import '../../app/account.css';
hydrateRoot(document.getElementById('root')!,<App initialPath={window.location.pathname}/>);
