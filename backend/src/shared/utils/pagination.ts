export const getPagination = (page: any, limit: any) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  return { page: p, limit: l, skip: (p - 1) * l };
};

export const getSort = <T extends Record<string, string>>(
  sort: any,
  allowedFields: T,
  defaultSort: keyof T,
  defaultDirection: 'asc' | 'desc' = 'desc'
) => {
  const [rawField, rawDirection] = String(sort || `${String(defaultSort)}:${defaultDirection}`).split(':');
  const field = allowedFields[rawField];
  if (!field) throw Object.assign(new Error(`Invalid sort field: ${rawField}`), { statusCode: 400 });

  const direction = rawDirection === 'asc' || rawDirection === 'desc' ? rawDirection : defaultDirection;
  return { [field]: direction };
};
