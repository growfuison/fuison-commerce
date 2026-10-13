import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../../chatgpt-auth';
import {currentStore,result,failure} from '../../../../lib/merchant-server';
export const dynamic='force-dynamic';
export async function GET(){try{const user=await getChatGPTUser();const store=user&&env.DB?await currentStore(user.userId):null;return result({emailReady:!!(env.RESEND_API_KEY&&env.VERIFICATION_FROM_EMAIL&&env.DB&&env.BUCKET),googleReady:false,platformSignedIn:!!user,email:user?.email||null,store:store?{name:store.business_name,slug:store.slug}:null})}catch(e){return failure(e)}}
