// Client-safe weather utilities — no server imports

export const regionCoords: Record<string, [number, number]> = {
  'Dublin':     [53.35, -6.26],
  'Cork':       [51.90, -8.47],
  'Galway':     [53.27, -9.06],
  'Limerick':   [52.66, -8.63],
  'Waterford':  [52.26, -7.11],
  'Kilkenny':   [52.65, -7.25],
  'Wexford':    [52.34, -6.46],
  'Kerry':      [52.15, -9.57],
  'Clare':      [52.90, -8.98],
  'Tipperary':  [52.47, -8.16],
  'Sligo':      [54.27, -8.47],
  'Donegal':    [54.65, -8.11],
  'Leitrim':    [53.98, -7.97],
  'Roscommon':  [53.63, -8.19],
  'Mayo':       [53.85, -9.30],
  'Westmeath':  [53.53, -7.42],
  'Longford':   [53.73, -7.79],
  'Offaly':     [53.27, -7.49],
  'Laois':      [52.99, -7.33],
  'Kildare':    [53.16, -6.91],
  'Wicklow':    [52.98, -6.04],
  'Meath':      [53.61, -6.66],
  'Louth':      [53.92, -6.50],
  'Cavan':      [54.00, -7.36],
  'Monaghan':   [54.25, -6.97],
  'Munster':    [52.30, -8.50],
  'Leinster':   [53.00, -7.00],
  'Connacht':   [53.50, -9.00],
  'Ulster':     [54.50, -7.00],
};

export function coordsForRegion(region: string): [number, number] {
  if (regionCoords[region]) return regionCoords[region];
  const key = Object.keys(regionCoords).find(
    (k) => region.toLowerCase().includes(k.toLowerCase())
  );
  return key ? regionCoords[key] : [53.35, -6.26];
}

export function wmoLabel(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Fog';
  if (code <= 55) return 'Drizzle';
  if (code <= 57) return 'Freezing drizzle';
  if (code <= 65) return 'Rain';
  if (code <= 67) return 'Freezing rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export function compassDir(deg: number): string {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function wmoEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}
