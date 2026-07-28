"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import { Toast } from "@/components/ui/Toast";
import { GlobalCartDrawer } from "@/components/shared/GlobalCartDrawer";
import { useProductStore } from "@/lib/stores/products";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const initProducts = useProductStore((s) => s.init);

  useEffect(() => { initProducts(); }, [initProducts]);
  
  const noNavbar = pathname?.startsWith('/waiter') || 
                   pathname?.startsWith('/chef') || 
                   pathname === '/login' || 
                   pathname === '/register' ||
                   pathname?.startsWith('/delivery/checkout') ||
                   pathname?.startsWith('/admin');

  const isMenu = pathname === '/menu';
  const isHome = pathname === '/';
  
  return (
    <>
      {!noNavbar && <Navbar />}
      <main className={noNavbar || isHome ? '' : `pb-20 md:pb-0 ${isMenu ? '' : 'md:pt-16'}`}>
        {children}
      </main>
      <Toast />
      <GlobalCartDrawer />
    </>
  );
}