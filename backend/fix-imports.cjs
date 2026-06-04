const fs = require('fs');
const path = require('path');

const files = [
  'c:/website/codexbyte/byteevolvr-main/backend/src/modules/approvals/approvals.routes.ts',
  'c:/website/codexbyte/byteevolvr-main/backend/src/modules/approvals/approvals.service.ts',
  'c:/website/codexbyte/byteevolvr-main/backend/src/modules/crm/crm.routes.ts',
  'c:/website/codexbyte/byteevolvr-main/backend/src/modules/crm/crm.service.ts',
  'c:/website/codexbyte/byteevolvr-main/backend/src/modules/crm/customer360.service.ts',
  'c:/website/codexbyte/byteevolvr-main/backend/src/modules/documents/documents.routes.ts',
  'c:/website/codexbyte/byteevolvr-main/backend/src/modules/documents/documents.service.ts',
  'c:/website/codexbyte/byteevolvr-main/backend/src/modules/operations/operations.routes.ts',
  'c:/website/codexbyte/byteevolvr-main/backend/src/modules/sla/sla.routes.ts',
  'c:/website/codexbyte/byteevolvr-main/backend/src/modules/sla/sla.service.ts',
  'c:/website/codexbyte/byteevolvr-main/backend/src/modules/workflows/workflows.routes.ts',
  'c:/website/codexbyte/byteevolvr-main/backend/src/modules/workflows/workflows.service.ts'
];

files.forEach(p => {
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  
  // Fix AppError imports to point to middlewares/error.js
  content = content.replace(/import \{ AppError \} from '..\/..\/core\/errors\/AppError\.js';/g, "import { AppError } from '../../middlewares/error.js';");
  
  // Replace EventSubscriber with eventBus
  content = content.replace(/import \{ EventSubscriber \} from '..\/..\/core\/events\/EventSubscriber\.js';/g, "import { eventBus } from '../../core/events/EventBus.js';");
  content = content.replace(/EventSubscriber\.emit\(/g, "eventBus.publish(<any>");
  
  fs.writeFileSync(p, content);
  console.log('Fixed ' + p);
});
