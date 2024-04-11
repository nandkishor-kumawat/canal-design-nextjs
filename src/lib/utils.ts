import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const kutterVelocity = ({ n, S, R }: { n: number, S: number, R: number }) => {
  const a = 1 / n + (23 + 0.00155 / S);
  const b = 1 + (23 + 0.00155 / S) * (n / Math.sqrt(R));
  const c = Math.sqrt(R * S);
  return (a / b) * c
}

export const roundTo = (num: number, places: number = 2) => +num.toFixed(places);
