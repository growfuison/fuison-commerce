export const MAX_LOGO_SIZE=2*1024*1024;
const reserved=new Set(['admin','api','assets','dashboard','demo','designs','faq','features','fuison','login','signup','support','www']);
export function normalizeEmail(value:unknown){if(typeof value!=='string')return null;const email=value.trim().toLowerCase();return email.length<=254&&/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email)?email:null}
export function validSlug(value:unknown):value is string{return typeof value==='string'&&/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(value)&&!reserved.has(value)&&!value.includes('--')}
export function makeSlug(value:string){return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40).replace(/-$/,'')}
export function validName(value:unknown):value is string{return typeof value==='string'&&value.trim().length>=2&&value.trim().length<=80&&!/[\u0000-\u001f\u007f]/.test(value)}
export function logoType(bytes:Uint8Array):'image/png'|'image/jpeg'|'image/webp'|null{
 if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';
 if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 if(bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';return null;
}
export function fiveDigitCode(){const value=new Uint32Array(1);do{crypto.getRandomValues(value)}while(value[0]>=4294900000);return String(value[0]%100000).padStart(5,'0')}
export function secretToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('')}
export async function sha256(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('')}
export async function codeDigest(secret:string,id:string,code:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const digest=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${id}:${code}`));return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('')}
export function equalDigest(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
