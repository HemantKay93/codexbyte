const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('c:/website/codexbyte/byteevolvr-main/apps/admin/src');
let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('components/ui/Table')) {
    // Remove the old import block
    content = content.replace(/import\s*\{[^}]*Table[^}]*\}\s*from\s*['"][.\/]+components\/ui\/Table['"];?\r?\n?/gs, '');
    
    // Add to existing @byteevolvr/ui import if it exists
    if (content.includes('@byteevolvr/ui')) {
        content = content.replace(/import\s*\{([^}]*)\}\s*from\s*['"]@byteevolvr\/ui['"];?/, (match, p1) => {
            const imports = p1.split(',').map(s => s.trim()).filter(Boolean);
            const needed = ['Table', 'TableBody', 'TableCell', 'TableHead', 'TableHeader', 'TableRow'];
            needed.forEach(n => { if (!imports.includes(n)) imports.push(n); });
            return "import { " + imports.join(', ') + " } from '@byteevolvr/ui';";
        });
    } else {
        content = "import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@byteevolvr/ui';\n" + content;
    }
    
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
    updatedCount++;
  }
});

console.log('Total files updated: ' + updatedCount);
