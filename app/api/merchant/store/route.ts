import {validName,validSlug} from '../../../../lib/merchant-validation';
import {nativeUser,database,bucket,sameOrigin,smallJson,verifiedProof,logoPrefix,currentStore,result,failure,MerchantError} from '../../../../lib/merchant-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 sameOrigin(request);const user=await nativeUser(),data=await smallJson(request),challenge=await verifiedProof(user.userId,data.challengeId,data.proof);
 if(!validName(data.ownerName)||!validName(data.businessName)||!validSlug(data.slug)||typeof data.logoKey!=='string'||data.logoKey.length>200||!data.logoKey.startsWith(await logoPrefix(user.userId)))throw new MerchantError('INVALID_STORE',400);
 const db=database(),existing=await currentStore(user.userId);if(existing)throw new MerchantError('STORE_EXISTS',409);const logo=await bucket().head(data.logoKey);if(!logo||logo.customMetadata?.owner!==user.userId)throw new MerchantError('INVALID_LOGO',400);
 const id=crypto.randomUUID(),now=Date.now();try{await db.batch([
 db.prepare("INSERT INTO merchant_stores (id,user_id,email,owner_name,business_name,slug,logo_key,created_at) SELECT ?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM email_challenges WHERE id=? AND user_id=? AND status='verified' AND proof_hash=? AND proof_expires_at>? AND consumed_at IS NULL)").bind(id,user.userId,challenge.email,data.ownerName.trim(),data.businessName.trim(),data.slug,data.logoKey,now,challenge.id,user.userId,challenge.proof_hash,now),
 db.prepare("UPDATE email_challenges SET consumed_at=? WHERE id=? AND EXISTS (SELECT 1 FROM merchant_stores WHERE id=? AND user_id=?)").bind(now,challenge.id,id,user.userId),
 ])}catch{if(await db.prepare('SELECT id FROM merchant_stores WHERE slug=?').bind(data.slug).first())throw new MerchantError('URL_TAKEN',409);throw new MerchantError('STORE_CREATE_FAILED',503)}
 const store=await db.prepare('SELECT id FROM merchant_stores WHERE id=? AND user_id=?').bind(id,user.userId).first();if(!store)throw new MerchantError('VERIFY_REQUIRED',403);
 return result({created:true,slug:data.slug,url:`/s/${data.slug}`,dashboard:'/dashboard'},201);
 }catch(e){return failure(e)}}
