import {validSlug} from '../../../../lib/merchant-validation';
import {database,nativeUser,result,failure} from '../../../../lib/merchant-server';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{await nativeUser();const slug=new URL(request.url).searchParams.get('slug');if(!validSlug(slug))return result({valid:false,available:false});const found=await database().prepare('SELECT id FROM merchant_stores WHERE slug=?').bind(slug).first();return result({valid:true,available:!found})}catch(e){return failure(e)}}
