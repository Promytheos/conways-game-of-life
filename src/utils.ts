export function randomNumber(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function randomNumberBetween(minInclusive: number, maxExclusive: number): number {
  return Math.floor(Math.random() * (maxExclusive - minInclusive + 1)) + minInclusive;
}

export function roundNumber(value: number, numPlaces: number = 0): number {
  const places = Math.pow(10, numPlaces);
  return Number(Math.round(value * places) / places);
}

export function getRandomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');

  return `#${hexR}${hexG}${hexB}`;
}

export function unwrap<T>(value: T | undefined, errorMsg: string = ''): T {
  if (value == undefined) {
    throw errorMsg;
  }
  return value;
}
