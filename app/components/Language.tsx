'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
type Language='bn'|'en';
const Context=createContext<{language:Language;setLanguage:(v:Language)=>void;t:(en:string,bn:string)=>string}>({language:'bn',setLanguage:()=>{},t:(_,bn)=>bn});
export function LanguageProvider({children,initialLanguage='bn'}:{children:ReactNode;initialLanguage?:Language}){
 const [language,setLanguage]=useState<Language>(initialLanguage);
 useEffect(()=>{try{const saved=localStorage.getItem('fuison-language');if(saved==='en'||saved==='bn')setLanguage(saved)}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=language;try{localStorage.setItem('fuison-language',language)}catch{}},[language]);
 return <Context.Provider value={{language,setLanguage,t:(en,bn)=>language==='en'?en:bn}}>{children}</Context.Provider>;
}
export const useLanguage=()=>useContext(Context);
