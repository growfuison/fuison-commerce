import {build} from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import React from 'react';
import {renderToString} from 'react-dom/server';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'out/netlify');
const aliases={'next/link':path.join(root,'deploy/netlify/router.tsx'),'next/navigation':path.join(root,'deploy/netlify/router.tsx')};
await build({configFile:false,root:path.join(root,'deploy/netlify'),publicDir:path.join(root,'public'),plugins:[react()],resolve:{alias:aliases},css:{postcss:path.join(root,'postcss.config.mjs')},build:{outDir:output,emptyOutDir:true}});
const ssrOut=path.join(root,'work/netlify-ssr');
await build({configFile:false,root,publicDir:false,plugins:[react()],resolve:{alias:aliases},build:{ssr:path.join(root,'deploy/netlify/App.tsx'),outDir:ssrOut,emptyOutDir:true,rollupOptions:{output:{entryFileNames:'App.mjs'}}}});
const {default:App,routes,pageTitle}=await import(pathToFileURL(path.join(ssrOut,'App.mjs')).href);
const template=await fs.readFile(path.join(output,'index.html'),'utf8');
for(const route of [...routes,'/not-found']){
 const markup=renderToString(React.createElement(App,{initialPath:route}));
 const html=template.replace('<div id="root"></div>',`<div id="root">${markup}</div>`).replace(/<title>.*?<\/title>/,`<title>${pageTitle(route)}</title>`);
 const destination=route==='/not-found'?path.join(output,'404.html'):path.join(output,route,'index.html');
 await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,html);
}
await fs.writeFile(path.join(output,'api-unavailable.json'),JSON.stringify({error:'SERVICE_UNAVAILABLE'}));
await fs.writeFile(path.join(output,'_redirects'),'/api/* /api-unavailable.json 503!\n/signin-with-chatgpt /login 301\n/* /404.html 404\n');
console.log(`Netlify: ${routes.length} prerendered pages, public entry flow and browser demo ready in ${output}.`);
