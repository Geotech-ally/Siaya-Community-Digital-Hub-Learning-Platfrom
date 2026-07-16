import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PublicThemeProvider } from '@/components/layout/PublicThemeProvider';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicThemeProvider>
      <div className="flex min-h-screen flex-col">
        <PublicNavbar />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </PublicThemeProvider>
  );
}
