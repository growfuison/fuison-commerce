import {requireChatGPTUser} from '../chatgpt-auth';
import {currentStore} from '../../lib/merchant-server';
import MerchantWorkspace from '../components/MerchantWorkspace';
export const dynamic='force-dynamic';
export const metadata={title:'My store — Fuison Commerce'};
export default async function Page(){const user=await requireChatGPTUser('/dashboard'),row=await currentStore(user.userId);return <MerchantWorkspace store={row?{businessName:row.business_name,ownerName:row.owner_name,slug:row.slug,email:row.email}:null}/>}
