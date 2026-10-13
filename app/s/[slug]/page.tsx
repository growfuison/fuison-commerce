import {notFound} from 'next/navigation';
import {database} from '../../../lib/merchant-server';
import {validSlug} from '../../../lib/merchant-validation';
import Storefront from '../../components/Storefront';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!validSlug(slug))return {title:'Store not found — Fuison Commerce'};const row=await database().prepare('SELECT business_name FROM merchant_stores WHERE slug=?').bind(slug).first<{business_name:string}>();return {title:row?`${row.business_name} — Fuison Commerce`:'Store not found — Fuison Commerce'}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!validSlug(slug))notFound();const row=await database().prepare('SELECT business_name FROM merchant_stores WHERE slug=?').bind(slug).first<{business_name:string}>();if(!row)notFound();return <Storefront name={row.business_name} slug={slug}/>}
