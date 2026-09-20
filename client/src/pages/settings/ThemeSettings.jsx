import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';
import FieldGroup from '../../components/ui/FieldGroup';
import Button from '../../components/ui/Button';

const MODES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

const ACCENTS = [
  { value: 'blue', label: 'Blue', color: '#1e3a8a' },
  { value: 'emerald', label: 'Emerald', color: '#047857' },
  { value: 'violet', label: 'Violet', color: '#6d28d9' },
  { value: 'rose', label: 'Rose', color: '#be123c' },
  { value: 'amber', label: 'Amber', color: '#b45309' }
];

const RADII = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' }
];

const DENSITIES = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' }
];

export default function ThemeSettings() {
  const {
    mode, accent, radius, density,
    setMode, setAccent, setRadius, setDensity,
    reset
  } = useTheme();

  return (
    <div className="space-y-6">
      <Card>
        <FieldGroup title="Appearance">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Mode
            </label>
            <div className="flex gap-2">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`px-4 py-2 rounded-[var(--radius)] text-sm font-medium border transition-colors ${
                    mode === m.value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Accent color
            </label>
            <div className="flex gap-2 flex-wrap">
              {ACCENTS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAccent(a.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    accent === a.value
                      ? 'border-[var(--accent)] scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: a.color }}
                  title={a.label}
                  aria-label={a.label}
                />
              ))}
            </div>
          </div>
        </FieldGroup>
      </Card>

      <Card>
        <FieldGroup title="Layout">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Border radius
            </label>
            <div className="flex gap-2">
              {RADII.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRadius(r.value)}
                  className={`px-4 py-2 rounded-[var(--radius)] text-sm font-medium border transition-colors ${
                    radius === r.value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Density
            </label>
            <div className="flex gap-2">
              {DENSITIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDensity(d.value)}
                  className={`px-4 py-2 rounded-[var(--radius)] text-sm font-medium border transition-colors ${
                    density === d.value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </FieldGroup>
      </Card>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={reset}>Reset to defaults</Button>
      </div>
    </div>
  );
}