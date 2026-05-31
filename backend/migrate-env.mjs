import fs from 'fs';
import path from 'path';

function findRelativeDepth(filePath, targetDir) {
  const dir = path.dirname(filePath);
  const relative = path.relative(dir, targetDir);
  return relative.startsWith('.') ? relative : `./${relative}`;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') && !fullPath.includes('env.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('process.env')) {
        // Exclude some fields that aren't in envSchema yet
        if (content.includes('process.env.FIREBASE') || content.includes('process.env.SMTP') || content.includes('process.env.GROWTHBOOK') || content.includes('process.env.SHIPROCKET')) {
           continue; // Skip these or add them to schema
        }

        const envDir = path.join(process.cwd(), 'src', 'config');
        let relativePath = findRelativeDepth(fullPath, envDir);
        relativePath = relativePath.replace(/\\/g, '/');
        
        const importStatement = `import { env } from '${relativePath}/env.js';\n`;
        
        if (!content.includes(importStatement)) {
           // Insert after last import or at top
           const importMatches = [...content.matchAll(/^import .*;/gm)];
           if (importMatches.length > 0) {
              const lastImportIndex = importMatches[importMatches.length - 1].index + importMatches[importMatches.length - 1][0].length;
              content = content.slice(0, lastImportIndex) + '\n' + importStatement + content.slice(lastImportIndex);
           } else {
              content = importStatement + content;
           }
        }
        
        content = content.replace(/process\.env/g, 'env');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(process.cwd(), 'src'));
console.log('Migration complete.');
