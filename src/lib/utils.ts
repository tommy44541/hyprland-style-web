import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const throttle = (callback: Function, limit: number) => {
  let waiting = false;
  return (...args: any[]) => {
    if (!waiting) {
      callback(...args);
      waiting = true;
      setTimeout(() => (waiting = false), limit);
    }
  };
};

export const sleep = (ms: number, next?: () => void) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("success");
      next && next()
    }, ms);
  });
}
