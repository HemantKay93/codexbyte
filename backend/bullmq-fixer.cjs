const fs = require('fs');
const glob = require('glob'); // Not available? We can just use a recursive function.
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // For Queues: new Queue('name', { connection...
  // We look for 'connection:' and if it's inside a Queue or Worker options object, we can just inject skipVersionCheck: true near it.
  // Actually, we can just replace `connection: redis` with `skipVersionCheck: true, connection: redis`
  // and `connection,` with `skipVersionCheck: true, connection,`
  // Wait! Some might have `connection: redisConfig.connection`
  
  // Safer regex: look for "new Queue(" or "new Worker("
  // But wait, the easiest is to just add it anywhere we see `connection: redis` inside bullmq files.
  if (content.includes('bullmq')) {
    content = content.replace(/connection:\s*redis/g, 'skipVersionCheck: true, connection: redis');
    content = content.replace(/connection\s*,/g, 'skipVersionCheck: true, connection,');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log('Fixed', file);
  }
}

console.log('Done! Modified ' + modifiedCount + ' files.');
