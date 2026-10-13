import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';
import {sha256} from './merchant-validation';
export type StoreRow={id:string;user_id:string;email:string;owner_name:string;business_name:string;slug:string;logo_key:string;created_at:number};
export type ChallengeRow={id:string;user_id:string;email:string;purpose:string;code_hash:string;expires_at:number;attempts:number;status:string;proof_hash:string|null;proof_expires_at:number|null;consumed_at:number|null};
export class MerchantError extends Error{constructor(public code:string,public status:number){super(code)}}
export function result(body:unknown,status=200){return Response.json(body,{status,headers:{'Cache-Control':'no-store'}})}
export function failure(error:unknown){if(error instanceof MerchantError)return result({error:error.code},error.status);console.error('Merchant operation failed');return result({error:'SERVICE_UNAVAILABLE'},503)}
export async function nativeUser(){const user=await getChatGPTUser();if(!user)throw new MerchantError('PLATFORM_SIGNIN_REQUIRED',401);return user}
export function database(){if(!env.DB)throw new MerchantError('STORAGE_UNAVAILABLE',503);return env.DB}
export function bucket(){if(!env.BUCKET)throw new MerchantError('STORAGE_UNAVAILABLE',503);return env.BUCKET}
export function sameOrigin(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin)throw new MerchantError('INVALID_ORIGIN',403)}
export async function limitedBody(request:Request,max:number,code='INVALID_REQUEST',status=413){const reader=request.body?.getReader();if(!reader)throw new MerchantError('INVALID_REQUEST',400);const chunks:Uint8Array[]=[];let length=0;try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>max){await reader.cancel();throw new MerchantError(code,status)}chunks.push(value)}}finally{reader.releaseLock()}const bytes=new Uint8Array(length);let offset=0;for(const part of chunks){bytes.set(part,offset);offset+=part.byteLength}return bytes.buffer}
export async function smallJson(request:Request){if(!request.headers.get('content-type')?.includes('application/json'))throw new MerchantError('INVALID_REQUEST',400);const text=new TextDecoder().decode(await limitedBody(request,16000));try{return JSON.parse(text)}catch{throw new MerchantError('INVALID_REQUEST',400)}}
export async function currentStore(userId:string){return database().prepare('SELECT * FROM merchant_stores WHERE user_id=?').bind(userId).first<StoreRow>()}
export async function verifiedProof(userId:string,id:unknown,proof:unknown,purpose='create'){
 if(typeof id!=='string'||!/^[-a-f0-9]{36}$/.test(id)||typeof proof!=='string'||!/^[a-f0-9]{64}$/.test(proof))throw new MerchantError('VERIFY_REQUIRED',403);
 const row=await database().prepare("SELECT * FROM email_challenges WHERE id=? AND user_id=? AND purpose=? AND status='verified' AND proof_hash=? AND proof_expires_at>? AND consumed_at IS NULL").bind(id,userId,purpose,await sha256(proof),Date.now()).first<ChallengeRow>();if(!row)throw new MerchantError('VERIFY_REQUIRED',403);return row;
}
export async function logoPrefix(userId:string){return `merchant/${await sha256(userId)}/`}
