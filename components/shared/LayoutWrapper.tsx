"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import { Toast } from "@/components/ui/Toast";
import { GlobalCartDrawer } from "@/components/shared/GlobalCartDrawer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const noNavbar = pathname?.startsWith('/waiter') || 
                   pathname === '/login' || 
                   pathname === '/register' ||
                   pathname?.startsWith('/delivery/checkout') ||
                   pathname === '/menu';
  
  return (
    <>
      {!noNavbar && <Navbar />}
      <main className={noNavbar ? '' : 'pt-16'}>
        {children}
      </main>
      <Toast />
      <GlobalCartDrawer />
    </>
  );
}