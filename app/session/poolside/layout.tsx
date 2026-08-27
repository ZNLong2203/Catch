import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Chế độ bờ hồ' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
