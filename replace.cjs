const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

content = content.replace(/border-white\/10/g, 'border-borderMain');
content = content.replace(/border-white\/5/g, 'border-borderFaint');
content = content.replace(/border-white\/30/g, 'border-borderStrong');
content = content.replace(/shadow-\[0_0_15px_#F0A03C\]/g, 'shadow-[0_0_15px_rgba(var(--rgb-primary),1)]');
content = content.replace(/shadow-\[0_0_10px_#2DD4BF\]/g, 'shadow-[0_0_10px_rgba(var(--rgb-secondary),1)]');
content = content.replace(/hover:text-white/g, 'hover:text-textMain');

fs.writeFileSync('src/App.jsx', content);
console.log('App.jsx updated!');
