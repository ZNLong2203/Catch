import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Gộp class Tailwind, cái sau đè cái trước.
 *  Chuẩn của shadcn/ui — mọi component trong components/ui đều dựa vào nó. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
