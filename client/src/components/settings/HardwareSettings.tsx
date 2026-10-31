import { useEffect, useState } from 'react';
import { Printer, ScanLine, Banknote, RefreshCw, CheckCircle2, XCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { useHardware } from '@/hooks/useHardware';
import { useToast } from '@/hooks/useNotification';
import type {
  PrinterDriverMode,
  PrinterType,
  PrinterConnection,
  ScannerMode,
  ScannerSuffix,
  DrawerMode,
  DrawerKick,
  PrinterConfigInput,
} from '@/types/receipt';
import type { NormalizedError } from '@/types/api';

interface FormState {
  driverMode: PrinterDriverMode;
  relayUrl: string;
  receiptPrinter: {
    name: string;
    type: PrinterType;
    connection: PrinterConnection;
    identifier: string;
    charWidth: number;
    enabled: boolean;
  };
  scanner: {
    mode: ScannerMode;
    identifier: string;
    suffix: ScannerSuffix;
    minLength: number;
    maxInterKeyMs: number;
  };
  cashDrawer: {
    mode: DrawerMode;
    kickCommand: DrawerKick;
    identifier: string;
  };
  autoPrintOnSale: boolean;
  copies: number;
  openCashDrawerOnSale: boolean;
}

const DEFAULTS: FormState = {
  driverMode: 'browser_print',
  relayUrl: 'http://localhost:9100',
  receiptPrinter: {
    name: '',
    type: 'thermal_80mm',
    connection: 'usb',
    identifier: '',
    charWidth: 48,
    enabled: false,
  },
  scanner: {
    mode: 'keyboard_wedge',
    identifier: '',
    suffix: 'Enter',
    minLength: 4,
    maxInterKeyMs: 50,
  },
  cashDrawer: {
    mode: 'via_printer',
    kickCommand: 'ESC_P',
    identifier: '',
  },
  autoPrintOnSale: true,
  copies: 1,
  openCashDrawerOnSale: true,
};

export function HardwareSettings() {
  const toast = useToast();
  const {
    config,
    loading,
    loadError,
    driverName,
    clientType,
    reload,
    saveConfig,
    printTest,
    openCashDrawer,
    config: cfg,
  } = useHardware();

  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [discovered, setDiscovered] = useState<{ name: string; identifier: string }[]>([]);
  const [discovering, setDiscovering] = useState(false);

  useEffect(() => {
    if (!config) {
      setForm(DEFAULTS);
      return;
    }
    setForm({
      driverMode: config.driverMode,
      relayUrl: config.relayUrl || DEFAULTS.relayUrl,
      receiptPrinter: {
        name: config.receiptPrinter?.name || '',
        type: config.receiptPrinter?.type || DEFAULTS.receiptPrinter.type,
        connection: config.receiptPrinter?.connection || DEFAULTS.receiptPrinter.connection,
        identifier: config.receiptPrinter?.identifier || '',
        charWidth: config.receiptPrinter?.charWidth ?? DEFAULTS.receiptPrinter.charWidth,
        enabled: config.receiptPrinter?.enabled ?? false,
      },
      scanner: {
        mode: config.scanner?.mode || DEFAULTS.scanner.mode,
        identifier: config.scanner?.identifier || '',
        suffix: config.scanner?.suffix || DEFAULTS.scanner.suffix,
        minLength: config.scanner?.minLength ?? DEFAULTS.scanner.minLength,
        maxInterKeyMs: config.scanner?.maxInterKeyMs ?? DEFAULTS.scanner.maxInterKeyMs,
      },
      cashDrawer: {
        mode: config.cashDrawer?.mode || DEFAULTS.cashDrawer.mode,
        kickCommand: config.cashDrawer?.kickCommand || DEFAULTS.cashDrawer.kickCommand,
        identifier: config.cashDrawer?.identifier || '',
      },
      autoPrintOnSale: config.autoPrintOnSale,
      copies: config.copies,
      openCashDrawerOnSale: config.openCashDrawerOnSale,
    });
  }, [config]);

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const patchReceiptPrinter = (patch: Partial<FormState['receiptPrinter']>) => {
    setForm((f) => ({ ...f, receiptPrinter: { ...f.receiptPrinter, ...patch } }));
  };

  const patchScanner = (patch: Partial<FormState['scanner']>) => {
    setForm((f) => ({ ...f, scanner: { ...f.scanner, ...patch } }));
  };

  const patchDrawer = (patch: Partial<FormState['cashDrawer']>) => {
    setForm((f) => ({ ...f, cashDrawer: { ...f.cashDrawer, ...patch } }));
  };

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);
    try {
      const payload: PrinterConfigInput = {
        deviceId: '',
        clientType: 'web',
        driverMode: form.driverMode,
        relayUrl: form.relayUrl,
        receiptPrinter: {
          name: form.receiptPrinter.name || null,
          type: form.receiptPrinter.type,
          connection: form.receiptPrinter.connection,
          identifier: form.receiptPrinter.identifier || null,
          charWidth: form.receiptPrinter.charWidth,
          enabled: form.receiptPrinter.enabled,
        },
        scanner: {
          mode: form.scanner.mode,
          identifier: form.scanner.identifier || null,
          suffix: form.scanner.suffix,
          minLength: form.scanner.minLength,
          maxInterKeyMs: form.scanner.maxInterKeyMs,
        },
        cashDrawer: {
          mode: form.cashDrawer.mode,
          kickCommand: form.cashDrawer.kickCommand,
          identifier: form.cashDrawer.identifier || null,
        },
        autoPrintOnSale: form.autoPrintOnSale,
        copies: form.copies,
        openCashDrawerOnSale: form.openCashDrawerOnSale,
      };
      await saveConfig(payload);
      toast.success('Hardware settings saved');
    } catch (err) {
      toast.error((err as NormalizedError).message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleTestPrint = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await printTest();
      setTestResult({
        ok: result.success,
        message: result.success
          ? `Printed successfully in ${result.durationMs}ms`
          : result.error || 'Print failed',
      });
      if (result.success) toast.success('Test printed');
      else toast.error(result.error || 'Test print failed');
    } catch (err) {
      setTestResult({ ok: false, message: (err as Error).message });
    } finally {
      setTesting(false);
    }
  };

  const handleTestDrawer = async () => {
    try {
      await openCashDrawer();
      toast.success('Drawer kick sent');
    } catch (err) {
      toast.error((err as Error).message || 'Drawer kick failed');
    }
  };

  const handleReload = async () => {
    await reload();
    toast.success('Configuration reloaded');
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    setDiscovered([]);
    try {
      const { hardware } = await import('@/lib/hardware');
      const list = await hardware.discover();
      setDiscovered(list.map((d) => ({ name: d.name, identifier: d.identifier })));
      if (list.length === 0) {
        toast.info?.('No printers found — check relay or desktop app');
      }
    } catch {
      toast.error('Discovery failed');
    } finally {
      setDiscovering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>
            Device: <strong className="text-foreground">{clientType}</strong>
          </span>
          <span>·</span>
          <span>
            Active driver: <strong className="text-foreground">{driverName}</strong>
          </span>
          {loadError ? (
            <>
              <span>·</span>
              <span className="text-destructive">{loadError}</span>
            </>
          ) : null}
          <button
            type="button"
            onClick={handleReload}
            className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
          >
            <RefreshCw className="h-3 w-3" /> Reload
          </button>
        </div>
      </div>

      {/* Printer */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Printer className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Receipt printer</h3>
        </div>

        <FormField label="Print mode">
          <Select
            value={form.driverMode}
            onChange={(e) => patch('driverMode', e.target.value as PrinterDriverMode)}
          >
            <option value="browser_print">Browser print (default — any printer)</option>
            <option value="thermal_relay">Thermal via print relay (localhost:9100)</option>
            <option value="thermal_usb">Thermal USB (desktop app only)</option>
            <option value="thermal_ble">Thermal Bluetooth (mobile app only)</option>
            <option value="none">Disabled</option>
          </Select>
        </FormField>

        {form.driverMode === 'thermal_relay' ? (
          <FormField label="Relay URL" hint="Default: http://localhost:9100">
            <Input
              value={form.relayUrl}
              onChange={(e) => patch('relayUrl', e.target.value)}
              placeholder="http://localhost:9100"
            />
          </FormField>
        ) : null}

        {form.driverMode !== 'browser_print' && form.driverMode !== 'none' ? (
          <>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <FormField label="Printer name" hint="System printer name (e.g. POS-80)">
                  <Input
                    value={form.receiptPrinter.name}
                    onChange={(e) => patchReceiptPrinter({ name: e.target.value })}
                    placeholder="POS-80"
                  />
                </FormField>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscover}
                loading={discovering}
              >
                Discover
              </Button>
            </div>

            {discovered.length > 0 ? (
              <div className="rounded-lg border border-border">
                <p className="border-b border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  Discovered printers
                </p>
                <div className="divide-y divide-border">
                  {discovered.map((d) => (
                    <button
                      key={d.identifier}
                      type="button"
                      onClick={() =>
                        patchReceiptPrinter({
                          name: d.name,
                          identifier: d.identifier,
                          enabled: true,
                        })
                      }
                      className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent"
                    >
                      <span className="font-medium text-foreground">{d.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {d.identifier}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Paper">
                <Select
                  value={form.receiptPrinter.type}
                  onChange={(e) =>
                    patchReceiptPrinter({ type: e.target.value as PrinterType })
                  }
                >
                  <option value="thermal_58mm">Thermal 58mm</option>
                  <option value="thermal_80mm">Thermal 80mm</option>
                  <option value="laser">Laser / inkjet</option>
                  <option value="label">Label printer</option>
                </Select>
              </FormField>
              <FormField label="Character width" hint="32 (58mm) / 48 (80mm)">
                <Input
                  type="number"
                  min={16}
                  max={96}
                  value={form.receiptPrinter.charWidth}
                  onChange={(e) =>
                    patchReceiptPrinter({ charWidth: Number(e.target.value) || 48 })
                  }
                />
              </FormField>
            </div>

            <FormField label="Connection">
              <Select
                value={form.receiptPrinter.connection}
                onChange={(e) =>
                  patchReceiptPrinter({
                    connection: e.target.value as PrinterConnection,
                  })
                }
              >
                <option value="usb">USB</option>
                <option value="network">Network</option>
                <option value="bluetooth">Bluetooth</option>
                <option value="serial">Serial</option>
              </Select>
            </FormField>
          </>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleTestPrint}
            loading={testing}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Test print
          </Button>
          {testResult ? (
            <span
              className={`inline-flex items-center gap-1 text-xs ${
                testResult.ok ? 'text-success' : 'text-destructive'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              {testResult.message}
            </span>
          ) : null}
        </div>
      </section>

      {/* Scanner */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <ScanLine className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Barcode scanner</h3>
        </div>

        <FormField
          label="Scanner mode"
          hint="Keyboard wedge works with any USB scanner (default)"
        >
          <Select
            value={form.scanner.mode}
            onChange={(e) => patchScanner({ mode: e.target.value as ScannerMode })}
          >
            <option value="keyboard_wedge">Keyboard wedge (USB scanner)</option>
            <option value="camera">Camera (mobile)</option>
            <option value="bluetooth">Bluetooth scanner</option>
          </Select>
        </FormField>

        {form.scanner.mode === 'keyboard_wedge' ? (
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Suffix">
              <Select
                value={form.scanner.suffix}
                onChange={(e) =>
                  patchScanner({ suffix: e.target.value as ScannerSuffix })
                }
              >
                <option value="Enter">Enter</option>
                <option value="Tab">Tab</option>
                <option value="None">None</option>
              </Select>
            </FormField>
            <FormField label="Min length">
              <Input
                type="number"
                min={1}
                max={64}
                value={form.scanner.minLength}
                onChange={(e) =>
                  patchScanner({ minLength: Number(e.target.value) || 4 })
                }
              />
            </FormField>
            <FormField label="Max key gap (ms)">
              <Input
                type="number"
                min={10}
                max={500}
                value={form.scanner.maxInterKeyMs}
                onChange={(e) =>
                  patchScanner({ maxInterKeyMs: Number(e.target.value) || 50 })
                }
              />
            </FormField>
          </div>
        ) : null}

        {form.scanner.mode !== 'keyboard_wedge' ? (
          <FormField
            label="Scanner identifier"
            hint="MAC address for Bluetooth scanners"
          >
            <Input
              value={form.scanner.identifier}
              onChange={(e) => patchScanner({ identifier: e.target.value })}
              placeholder="AA:BB:CC:DD:EE:FF"
            />
          </FormField>
        ) : null}
      </section>

      {/* Cash drawer */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Banknote className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Cash drawer</h3>
        </div>

        <FormField label="Drawer mode">
          <Select
            value={form.cashDrawer.mode}
            onChange={(e) => patchDrawer({ mode: e.target.value as DrawerMode })}
          >
            <option value="via_printer">Via receipt printer (RJ11 to printer)</option>
            <option value="usb">USB directly</option>
            <option value="serial">Serial port</option>
            <option value="none">Not connected</option>
          </Select>
        </FormField>

        {form.cashDrawer.mode === 'via_printer' ? (
          <FormField label="Kick command">
            <Select
              value={form.cashDrawer.kickCommand}
              onChange={(e) =>
                patchDrawer({ kickCommand: e.target.value as DrawerKick })
              }
            >
              <option value="ESC_P">ESC p (standard Epson)</option>
              <option value="ESC_p">ESC p 0 60 120 (alternative)</option>
              <option value="custom">Custom</option>
            </Select>
          </FormField>
        ) : null}

        {form.cashDrawer.mode === 'usb' || form.cashDrawer.mode === 'serial' ? (
          <FormField label="Device identifier">
            <Input
              value={form.cashDrawer.identifier}
              onChange={(e) => patchDrawer({ identifier: e.target.value })}
              placeholder="USB001 or /dev/ttyUSB0"
            />
          </FormField>
        ) : null}

        <Button
          type="button"
          variant="outline"
          onClick={handleTestDrawer}
          leftIcon={<Banknote className="h-4 w-4" />}
        >
          Test open drawer
        </Button>
      </section>

      {/* Sale behavior */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <h3 className="text-sm font-semibold text-foreground">Sale behavior</h3>
        </div>

        <div className="grid gap-3">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-sm text-foreground">Auto-print receipt on sale</span>
            <input
              type="checkbox"
              checked={form.autoPrintOnSale}
              onChange={(e) => patch('autoPrintOnSale', e.target.checked)}
              className="h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-sm text-foreground">Open drawer on sale</span>
            <input
              type="checkbox"
              checked={form.openCashDrawerOnSale}
              onChange={(e) => patch('openCashDrawerOnSale', e.target.checked)}
              className="h-4 w-4"
            />
          </label>

          <div>
            <FormField label="Copies">
              <Input
                type="number"
                min={1}
                max={5}
                value={form.copies}
                onChange={(e) => patch('copies', Number(e.target.value) || 1)}
              />
            </FormField>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button onClick={handleSave} loading={saving} leftIcon={<Save className="h-4 w-4" />}>
          Save settings
        </Button>
      </div>
    </div>
  );
}