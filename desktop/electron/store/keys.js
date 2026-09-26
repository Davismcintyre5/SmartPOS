export const KEYS = {
  DEVICE_ID: 'deviceId',
  DEVICE_NAME: 'deviceName',

  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  CURRENT_USER: 'currentUser',

  ACTIVE_BRANCH_ID: 'activeBranchId',
  ACTIVE_BRANCH_NAME: 'activeBranchName',

  PRINTER_NAME: 'printerName',
  PRINTER_WIDTH: 'printerWidth',
  DRAWER_ENABLED: 'drawerEnabled',

  WINDOW_BOUNDS: 'windowBounds',
  WINDOW_MAXIMIZED: 'windowMaximized',

  FIRST_LAUNCH_AT: 'firstLaunchAt',
  LAST_SYNC_AT: 'lastSyncAt',
  UPDATE_CHANNEL: 'updateChannel',
};

export const DEFAULTS = {
  [KEYS.PRINTER_WIDTH]: 80,
  [KEYS.DRAWER_ENABLED]: true,
  [KEYS.UPDATE_CHANNEL]: 'latest',
};