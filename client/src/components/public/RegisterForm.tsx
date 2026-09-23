import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { Building2, Mail, Lock, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { authApi } from '@/api/auth';
import { tokenStorage } from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useNotification';
import { useSite } from '@/hooks/useSite';
import type { NormalizedError } from '@/types/api';
import type { LoginResponse } from '@/types/auth';

export function RegisterForm() {
  const { setSession } = useAuth();
  const { countries, businessTypes } = useSite();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const planId = params.get('plan') || 'starter';

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('KE');
  const [businessType, setBusinessType] = useState('retail');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim() || !ownerName.trim() || !email.trim() || !password) {
      setError('All required fields must be filled');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.register({
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        country,
        businessType,
        password,
        planId,
      });

      const session: LoginResponse & { invoice: typeof result.invoice } = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        tenant: result.tenant,
        plan: result.plan,
        scope: 'pending',
        invoice: result.invoice ?? null,
      };

      flushSync(() => {
        setSession(session);
        tokenStorage.setRefresh(result.refreshToken);
      });

      toast.success({
        title: 'Account created',
        description: 'Your registration is pending approval.',
      });

      navigate('/pending', { replace: true });
    } catch (e) {
      const err = e as NormalizedError;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {planId ? (
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Selected plan:{' '}
          <span className="font-medium capitalize text-foreground">{planId}</span>
        </div>
      ) : null}

      <FormField label="Business name" htmlFor="businessName" required>
        <Input
          id="businessName"
          placeholder="Acme Retail"
          leftIcon={<Building2 className="h-4 w-4" />}
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          disabled={loading}
        />
      </FormField>

      <FormField label="Your name" htmlFor="ownerName" required>
        <Input
          id="ownerName"
          placeholder="Jane Doe"
          leftIcon={<User className="h-4 w-4" />}
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          disabled={loading}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </FormField>

        <FormField label="Phone" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            placeholder="+254 700 000 000"
            leftIcon={<Phone className="h-4 w-4" />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Country" htmlFor="country">
          <Select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={loading}
          >
            {countries.length === 0 ? <option value="KE">Kenya</option> : null}
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Business type" htmlFor="businessType">
          <Select
            id="businessType"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            disabled={loading}
          >
            {businessTypes.length === 0 ? (
              <option value="retail">Retail</option>
            ) : null}
            {businessTypes.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField
        label="Password"
        htmlFor="password"
        required
        hint="At least 8 characters"
      >
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </FormField>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      <Button type="submit" fullWidth size="lg" loading={loading}>
        Create account
      </Button>
    </form>
  );
}