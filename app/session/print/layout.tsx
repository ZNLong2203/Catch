import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Giáo án buổi sau' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
