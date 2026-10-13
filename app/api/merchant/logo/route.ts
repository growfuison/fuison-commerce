import {MAX_LOGO_SIZE,logoType} from '../../../../lib/merchant-validation';
import {nativeUser,bucket,sameOrigin,verifiedProof,logoPrefix,result,failure,MerchantError,limitedBody} from '../../../../lib/merchant-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 sameOrigin(request);const user=await nativeUser();if(Number(request.headers.get('content-length')||0)>MAX_LOGO_SIZE+16384)throw new MerchantError('INVALID_LOGO',400);
 const contentType=request.headers.get('content-type');if(!contentType?.startsWith('multipart/form-data;'))throw new MerchantError('INVALID_LOGO',400);const body=await limitedBody(request,MAX_LOGO_SIZE+16384,'INVALID_LOGO',400);const form=await new Response(body,{headers:{'Content-Type':contentType}}).formData();await verifiedProof(user.userId,form.get('challengeId'),form.get('proof'));const file=form.get('logo');if(!(file instanceof File)||!file.size||file.size>MAX_LOGO_SIZE)throw new MerchantError('INVALID_LOGO',400);
 const bytes=new Uint8Array(await file.arrayBuffer()),type=logoType(bytes);if(!type||file.type!==type)throw new MerchantError('INVALID_LOGO',400);
 const key=`${await logoPrefix(user.userId)}${crypto.randomUUID()}.${type==='image/png'?'png':type==='image/jpeg'?'jpg':'webp'}`;
 await bucket().put(key,bytes,{httpMetadata:{contentType:type},customMetadata:{owner:user.userId}});return result({logoKey:key});
 }catch(e){return failure(e)}}
