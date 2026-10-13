import {env} from 'cloudflare:workers';
import {normalizeEmail,fiveDigitCode,codeDigest} from '../../../../../lib/merchant-validation';
import {nativeUser,database,currentStore,sameOrigin,smallJson,result,failure,MerchantError} from '../../../../../lib/merchant-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 sameOrigin(request);const user=await nativeUser();if(!env.RESEND_API_KEY||!env.VERIFICATION_FROM_EMAIL)throw new MerchantError('EMAIL_NOT_CONFIGURED',503);
 const data=await smallJson(request),email=normalizeEmail(data.email),purpose=data.purpose==='login'?'login':'create';if(!email)throw new MerchantError('INVALID_EMAIL',400);
 // This verifies a contact email under the platform-owned identity; it does not create another session.
 if(email!==user.email.toLowerCase())throw new MerchantError('USE_ACCOUNT_EMAIL',400);
 const db=database(),store=await currentStore(user.userId);if(purpose==='create'&&store)throw new MerchantError('STORE_EXISTS',409);if(purpose==='login'&&!store)throw new MerchantError('STORE_NOT_FOUND',404);
 const id=crypto.randomUUID(),code=fiveDigitCode(),now=Date.now(),hash=await codeDigest(env.RESEND_API_KEY,id,code);
 const inserted=await db.prepare("INSERT INTO email_challenges (id,user_id,email,purpose,code_hash,created_at,expires_at,attempts,status) SELECT ?,?,?,?,?,?,?,0,'pending' WHERE NOT EXISTS (SELECT 1 FROM email_challenges WHERE user_id=? AND created_at>?) AND (SELECT COUNT(*) FROM email_challenges WHERE user_id=? AND created_at>?)<5").bind(id,user.userId,email,purpose,hash,now,now+600000,user.userId,now-60000,user.userId,now-3600000).run();
 if(!inserted.meta.changes)throw new MerchantError('TOO_MANY_CODES',429);
 let delivered=false;try{const sent=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`fuison-verification-${id}`},body:JSON.stringify({from:env.VERIFICATION_FROM_EMAIL,to:[email],subject:`${code} — Fuison Commerce verification`,text:`Your Fuison Commerce verification code is ${code}. It expires in 10 minutes. Do not share it with anyone.\n\nআপনার ভেরিফিকেশন কোড: ${code}। ১০ মিনিটের মধ্যে ব্যবহার করুন। কাউকে কোডটি দেবেন না।`}),signal:AbortSignal.timeout(15000)});delivered=sent.ok}catch{}
 if(!delivered){await db.prepare("UPDATE email_challenges SET status='failed' WHERE id=?").bind(id).run();throw new MerchantError('EMAIL_SEND_FAILED',502)}
 await db.batch([db.prepare("UPDATE email_challenges SET status='superseded' WHERE user_id=? AND id<>? AND status IN ('sent','verified') AND consumed_at IS NULL").bind(user.userId,id),db.prepare("UPDATE email_challenges SET status='sent' WHERE id=?").bind(id)]);
 return result({challengeId:id,expiresAt:now+600000,resendAfter:now+60000});
 }catch(e){return failure(e)}}
