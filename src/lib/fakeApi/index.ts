//src/lib/fakeApi/index.ts
export const apiDelay = (ms = 300) => new Promise(res => setTimeout(res, ms));

export function ok<T>(data: T): Promise<T> {
  return new Promise(async (res) => { await apiDelay(); res(data); });
}

export function fail<T = never>(message: string): Promise<T> {
  return new Promise((_res, rej) => setTimeout(() => rej(new Error(message)), 250));
}

export function uid() { return Math.random().toString(36).slice(2, 10); }
