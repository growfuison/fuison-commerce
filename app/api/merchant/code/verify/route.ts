import {env} from 'cloudflare:workers';
import {codeDigest,equalDigest,secretToken,sha256} from '../../../../../lib/merchant-validation';
import {nativeUser,database,sameOrigin,smallJson,result,failure,MerchantError,type ChallengeRow} from '../../../../../lib/merchant-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 sameOrigin(request);const user=await nativeUser(),data=await smallJson(request);if(typeof data.code!=='string'||!/^\d{5}$/.test(data.code)||typeof data.challengeId!=='string'||data.challengeId.length!==36)throw new MerchantError('INVALID_CODE',400);if(!env.RESEND_API_KEY)throw new MerchantError('EMAIL_NOT_CONFIGURED',503);
 const db=database(),now=Date.now();const row=await db.prepare("UPDATE email_challenges SET attempts=attempts+1 WHERE id=? AND user_id=? AND status='sent' AND attempts<5 AND expires_at>? RETURNING *").bind(data.challengeId,user.userId,now).first<ChallengeRow>();if(!row)throw new MerchantError('CODE_EXPIRED_OR_LOCKED',400);
 if(!equalDigest(await codeDigest(env.RESEND_API_KEY,row.id,data.code),row.code_hash))throw new MerchantError('INVALID_CODE',400);
 const proof=secretToken();const updated=await db.prepare("UPDATE email_challenges SET status='verified',verified_at=?,proof_hash=?,proof_expires_at=? WHERE id=? AND user_id=? AND status='sent' AND attempts=?").bind(now,await sha256(proof),now+1200000,row.id,user.userId,row.attempts).run();if(!updated.meta.changes)throw new MerchantError('CODE_EXPIRED_OR_LOCKED',400);
 return result({verified:true,proof,challengeId:row.id,purpose:row.purpose,expiresAt:now+1200000});
 }catch(e){return failure(e)}}
