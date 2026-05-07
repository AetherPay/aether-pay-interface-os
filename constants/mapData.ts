export const CURRENCY_COUNTRIES: Record<string, string[]> = {
  XOF: ['SN', 'ML', 'BF', 'CI', 'TG', 'BJ'],
  XAF: ['CM', 'GA', 'CG'],
  GHS: ['GH'],
  NGN: ['NG'],
  KES: ['KE'],
  EUR: ['FR'],
  USD: ['US'],
};

// Approximate SVG positions on Africa-centered map (viewBox 0 0 480 380)
export const COUNTRY_NODES = [
  // North Africa (dim — background context)
  { id: 'MA', name: 'Maroc',       x: 105, y: 68,  dim: true  },
  { id: 'DZ', name: 'Algérie',     x: 162, y: 64,  dim: true  },
  { id: 'LY', name: 'Libye',       x: 218, y: 70,  dim: true  },
  { id: 'EG', name: 'Égypte',      x: 275, y: 76,  dim: true  },
  // West Africa — XOF zone
  { id: 'SN', name: 'Sénégal',     x: 55,  y: 148, dim: false },
  { id: 'ML', name: 'Mali',        x: 118, y: 138, dim: false },
  { id: 'BF', name: 'Burkina',     x: 148, y: 158, dim: false },
  { id: 'CI', name: "Côte d'Iv",  x: 110, y: 188, dim: false },
  { id: 'TG', name: 'Togo',        x: 158, y: 180, dim: false },
  { id: 'BJ', name: 'Bénin',       x: 172, y: 172, dim: false },
  // Ghana
  { id: 'GH', name: 'Ghana',       x: 138, y: 184, dim: false },
  // Nigeria
  { id: 'NG', name: 'Nigeria',     x: 195, y: 168, dim: false },
  // Central Africa — XAF zone
  { id: 'CM', name: 'Cameroun',    x: 222, y: 190, dim: false },
  { id: 'GA', name: 'Gabon',       x: 205, y: 220, dim: false },
  { id: 'CG', name: 'Congo',       x: 228, y: 232, dim: false },
  { id: 'CD', name: 'RD Congo',    x: 262, y: 232, dim: true  },
  // East Africa
  { id: 'ET', name: 'Éthiopie',    x: 322, y: 162, dim: true  },
  { id: 'KE', name: 'Kenya',       x: 338, y: 205, dim: false },
  { id: 'TZ', name: 'Tanzanie',    x: 325, y: 245, dim: true  },
  // Southern Africa (for completeness)
  { id: 'ZA', name: 'Afr. Sud',    x: 248, y: 342, dim: true  },
  { id: 'MZ', name: 'Mozam.',      x: 302, y: 298, dim: true  },
  // Europe (off-map top — diaspora payments)
  { id: 'FR', name: 'France',      x: 148, y: 22,  dim: false },
  // Americas (off-map left)
  { id: 'US', name: 'États-Unis',  x: 18,  y: 88,  dim: false },
];

// Thin connection lines between countries
export const MAP_CONNECTIONS: [string, string][] = [
  // XOF zone
  ['SN', 'ML'], ['ML', 'BF'], ['BF', 'CI'], ['BF', 'TG'], ['TG', 'BJ'], ['BJ', 'NG'],
  ['SN', 'CI'], ['CI', 'GH'], ['GH', 'TG'],
  // XAF zone
  ['CM', 'GA'], ['GA', 'CG'], ['CM', 'CG'],
  // Cross-region
  ['NG', 'CM'],
  // East
  ['ET', 'KE'],
  // Trans-continental (long, subtle)
  ['SN', 'FR'], ['NG', 'FR'], ['FR', 'US'],
];
