import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','styles.css','app.mjs','model.mjs']) await copyFile(file,`dist/${file}`);
console.log('Built InstituteConnect into dist/');
