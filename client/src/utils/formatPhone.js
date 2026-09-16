export function toMsisdn(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('7') || digits.startsWith('1')) return `254${digits}`;
  return digits;
}

export function formatPhone(phone) {
  const m = toMsisdn(phone);
  if (m.length === 12) return `+${m.slice(0, 3)} ${m.slice(3, 6)} ${m.slice(6, 9)} ${m.slice(9)}`;
  return phone;
}

export function formatPhoneLocal(phone) {
  const m = toMsisdn(phone);
  if (m.length === 12) return `0${m.slice(3, 6)} ${m.slice(6, 9)} ${m.slice(9)}`;
  return phone;
}

export default { toMsisdn, formatPhone, formatPhoneLocal };