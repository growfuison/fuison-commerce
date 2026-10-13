import {createContext,useContext,type AnchorHTMLAttributes,type MouseEvent,type ReactNode} from 'react';

export const PathContext=createContext('/');
export const usePathname=()=>useContext(PathContext);
export function navigate(href:string,replace=false){
 const url=new URL(href,window.location.href);
 if(url.origin!==window.location.origin){window.location.assign(url.href);return}
 window.history[replace?'replaceState':'pushState'](null,'',url.pathname+url.search+url.hash);
 window.dispatchEvent(new Event('fuison:navigate'));
 if(url.hash){requestAnimationFrame(()=>document.getElementById(url.hash.slice(1))?.scrollIntoView())}else window.scrollTo(0,0);
}
const router={push:(url:string)=>navigate(url),replace:(url:string)=>navigate(url,true),back:()=>window.history.back(),forward:()=>window.history.forward(),refresh:()=>window.location.reload(),prefetch:()=>{}};
export const useRouter=()=>router;
export default function Link({href,prefetch:_,children,onClick,replace=false,...props}:AnchorHTMLAttributes<HTMLAnchorElement>&{href:string;prefetch?:boolean;replace?:boolean;children?:ReactNode}){
 function click(e:MouseEvent<HTMLAnchorElement>){
  onClick?.(e);
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||props.target||props.download)return;
  const url=new URL(href,window.location.href);
  if(url.origin!==window.location.origin)return;
  e.preventDefault();navigate(href,replace);
 }
 return <a {...props} href={href} onClick={click}>{children}</a>;
}
