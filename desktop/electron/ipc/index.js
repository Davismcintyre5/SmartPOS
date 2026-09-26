import { registerAppIpc } from './app.js';
import { registerPrinterIpc } from './printer.js';
import { registerDrawerIpc } from './drawer.js';
import { registerDbIpc } from './db.js';
import { registerSyncIpc } from './sync.js';
import { registerUpdaterIpc } from './updater.js';

export function registerAllIpc() {
  registerAppIpc();
  registerPrinterIpc();
  registerDrawerIpc();
  registerDbIpc();
  registerSyncIpc();
  registerUpdaterIpc();
}