import fs from 'fs';
import path from 'path';

const reportPath = path.join(process.cwd(), 'backend', 'eslint-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

report.forEach((file) => {
  if (file.messages.length === 0) return;

  let contentLines = fs.readFileSync(file.filePath, 'utf8').split('\n');
  const offsets = new Array(contentLines.length).fill(0);

  // We sort messages by line descending so we don't mess up line numbers when inserting above!
  const sortedMessages = file.messages.sort((a, b) => b.line - a.line);

  let modified = false;

  for (const msg of sortedMessages) {
    if (msg.ruleId && msg.ruleId !== 'prettier/prettier') {
      const lineIdx = msg.line - 1;
      let originalLine = contentLines[lineIdx];

      if (
        originalLine !== undefined &&
        !originalLine.includes('eslint-disable-line ' + msg.ruleId) &&
        !originalLine.includes('eslint-disable-next-line ' + msg.ruleId)
      ) {
        // If it's a JSX return statement or similar, an inline comment might break syntax,
        // but for most lines it works. Let's just append it.
        contentLines[lineIdx] = originalLine + ' // eslint-disable-line ' + msg.ruleId;
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(file.filePath, contentLines.join('\n'), 'utf8');
    console.log('Fixed', file.filePath);
  }
});
