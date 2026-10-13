import {useEffect,useState} from 'react';
import MarketingSite from '../../app/components/MarketingSite';
import AccountFlow from '../../app/components/AccountFlow';
import Dashboard from '../../app/components/Dashboard';
import Brand from '../../app/components/Brand';
import {LanguageProvider,useLanguage} from '../../app/components/Language';
import Link,{PathContext} from './router';

export const routes=['/','/features','/designs','/how-it-works','/faq','/signup','/login','/demo','/dashboard'];
const pages={'/':'home','/features':'features','/designs':'designs','/how-it-works':'how-it-works','/faq':'faq'} as const;
export function pageTitle(path:string){const label:Record<string,string>={'/features':'Features','/designs':'Store designs','/how-it-works':'How it works','/faq':'FAQs','/signup':'Create Free Store','/login':'Log in','/dashboard':'Log in','/demo':'Merchant demo'};return label[path]?`${label[path]} — Fuison Commerce`:path==='/'?'Fuison Commerce — Your Brand Deserves Its Own Store':'Page not found — Fuison Commerce'}
function NotFound(){const {t}=useLanguage();return <div className="fc-site"><header className="wrap fc-account-header"><Brand/></header><main className="wrap" style={{padding:'100px 24px',minHeight:'70vh'}}><span className="fc-eyebrow">404</span><h1>{t('This page is not available.','এই পেজটি পাওয়া যাচ্ছে না।')}</h1><p style={{margin:'24px 0'}}>{t('Check the address or return to the homepage.','ঠিকানাটি যাচাই করুন অথবা হোমে ফিরে যান।')}</p><Link className="fc-button" href="/">{t('Back to home','হোমে ফিরুন')}</Link></main></div>}
function Content({path}:{path:string}){if(path in pages)return <MarketingSite key={path} page={pages[path as keyof typeof pages]}/>;if(path==='/signup')return <AccountFlow key="signup" hosting="public"/>;if(path==='/login'||path==='/dashboard')return <AccountFlow key="login" hosting="public" mode="login"/>;if(path==='/demo')return <Dashboard/>;return <NotFound/>}
export default function App({initialPath='/',initialLanguage='bn'}:{initialPath?:string;initialLanguage?:'bn'|'en'}){
 const [path,setPath]=useState(initialPath.replace(/\/$/,'')||'/');
 useEffect(()=>{function update(){setPath(window.location.pathname.replace(/\/$/,'')||'/')}window.addEventListener('popstate',update);window.addEventListener('fuison:navigate',update);return()=>{window.removeEventListener('popstate',update);window.removeEventListener('fuison:navigate',update)}},[]);
 useEffect(()=>{document.title=pageTitle(path)},[path]);
 return <PathContext.Provider value={path}><LanguageProvider initialLanguage={initialLanguage}><Content path={path}/></LanguageProvider></PathContext.Provider>;
}
