const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/jitsu/Desktop/Myeca7.3/client/public/assets/logos';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
files.forEach(file => {
  let p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  let changed = false;
  
  if (!content.includes('viewBox=')) {
    let wMatch = content.match(/<svg[^>]*\swidth="([\d\.]+)[^"]*"/);
    let hMatch = content.match(/<svg[^>]*\sheight="([\d\.]+)[^"]*"/);
    if (wMatch && hMatch) {
       content = content.replace(/<svg\s/, '<svg viewBox="0 0 ' + wMatch[1] + ' ' + hMatch[1] + '" ');
       changed = true;
    }
  }

  if (content.match(/<svg[^>]*\swidth="[^"]*"/)) {
     content = content.replace(/(<svg[^>]*\s)width="[^"]*"/g, '$1width="100%"');
     changed = true;
  }
  if (content.match(/<svg[^>]*\sheight="[^"]*"/)) {
     content = content.replace(/(<svg[^>]*\s)height="[^"]*"/g, '$1height="100%"');
     changed = true;
  }

  if (changed) {
    fs.writeFileSync(p, content);
    console.log('Fixed ' + file);
  }
});
