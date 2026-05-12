export function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatPhone(phone: string): string {
  if (phone.startsWith('0')) return `+62${phone.substring(1)}`;
  return phone;
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const formatted = formatPhone(phone).replace(/[^0-9+]/g, '');
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}