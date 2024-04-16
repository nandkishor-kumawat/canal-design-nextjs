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


export const solveEquations = (P: number, A: number, m: number) => {
  // Calculate coefficients of the quadratic equation
  const a = 2 * Math.sqrt(1 + m ** 2)
  let c = -A;
  let b = P;
  let aCoeff = m - a;

  // Calculate discriminant
  let discriminant = b * b - 4 * aCoeff * c;

  // Check if roots are real
  if (discriminant < 0) {
    console.log("No real roots");
    return { y: 0, B: 0 };
  }

  // Calculate roots
  let root1 = roundTo((-b + Math.sqrt(discriminant)) / (2 * aCoeff));
  let root2 = roundTo((-b - Math.sqrt(discriminant)) / (2 * aCoeff));


  let nonNegativeRoots = [];
  let B1 = roundTo(P - a * root1);
  let B2 = roundTo(P - a * root2);

  if (root1 > 0 && B1 > 0) {
    nonNegativeRoots.push({ y: root1, B: B1 })
  }
  if (root2 > 0 && B2 > 0) {
    nonNegativeRoots.push({ y: root2, B: B2 })
  }

  return nonNegativeRoots[0];
}

export const getTrialDepth = (discharge: number) => {
  return discharge < 20 ? 1 : discharge < 40 ? 2 : discharge < 80 ? 2.5 : discharge <= 100 ? 3 : 3.5;
}