import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
const packages=await fs.readdir('node_modules/.pnpm');const sharp=(await import(path.resolve('node_modules/.pnpm',packages.find(n=>n.startsWith('sharp@')),'node_modules/sharp/dist/index.mjs'))).default;
await fs.mkdir('source-assets',{recursive:true});await fs.mkdir('work',{recursive:true});
const files={};
for(const name of ['fuison-logo.png','commerce-editorial.png']){try{await fs.access('source-assets/'+name)}catch{await fs.copyFile('public/assets/'+name,'source-assets/'+name)}}
async function make(name,source,width,lossless=false){const bytes=await sharp(source).resize({width,withoutEnlargement:true}).webp(lossless?{lossless:true,effort:6}:{quality:82,effort:5}).toBuffer();const hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,10),out=`${name}.${hash}.webp`;await fs.writeFile(`public/assets/${out}`,bytes);files[name]={file:out,bytes:bytes.length,...await sharp(bytes).metadata()};console.log(`${name}: ${bytes.length} bytes`)}
await make('commerce-hero-800','source-assets/commerce-editorial.png',800);await make('commerce-hero-400','source-assets/commerce-editorial.png',400);const mark=await sharp('source-assets/fuison-logo.png').extract({left:420,top:245,width:505,height:440}).resize({width:202}).webp({quality:95,effort:6}).toBuffer();const markName='fuison-mark.'+crypto.createHash('sha256').update(mark).digest('hex').slice(0,10)+'.webp';await fs.writeFile('public/assets/'+markName,mark);files['fuison-mark']={file:markName,bytes:mark.length,width:202,height:176};console.log('fuison-mark: '+mark.length+' bytes');
for(const name of ['watch','perfume','sneaker']){await make(name+'-800','public/assets/'+name+'.jpg',800);await make(name+'-160','public/assets/'+name+'.jpg',160)}

await fs.writeFile('work/optimized-assets.json',JSON.stringify(files,null,2));
