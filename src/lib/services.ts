export type Service = {
  id: string;
  name: string;
  category: string;
  region: string;
  feeEur: number;
  durationDays: number;
  availability: string;
  slotsThisWeek: number;
  specialOffer?: string;
  description: string;
};

export function formatEur(n: number) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

const categoryImage: Record<string, string> = {
  'Structural Surveys': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop',
  'Structural Inspections': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&auto=format&fit=crop',
  'Geotechnical': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80&auto=format&fit=crop',
  'Drone Surveys': 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&q=80&auto=format&fit=crop',
  'Vibration Monitoring': 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=1200&q=80&auto=format&fit=crop',
  'Geophysical Surveys': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80&auto=format&fit=crop',
  'Measured Surveys': 'https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=1200&q=80&auto=format&fit=crop',
  'Environmental': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop',
};

const overrides: Record<string, string> = {
  RS009: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&q=80&auto=format&fit=crop',
  RS010: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&q=80&auto=format&fit=crop',
  RS011: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80&auto=format&fit=crop',
  RS021: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200&q=80&auto=format&fit=crop',
  RS022: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80&auto=format&fit=crop',
  RS023: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80&auto=format&fit=crop',
  RS024: 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=1200&q=80&auto=format&fit=crop',
  RS027: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=1200&q=80&auto=format&fit=crop',
  RS028: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80&auto=format&fit=crop',
  RS029: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80&auto=format&fit=crop',
  RS020: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop',
};

export function imageFor(s: Service): string {
  return overrides[s.id] ?? categoryImage[s.category] ?? categoryImage['Structural Surveys'];
}
