"use client";
import { CartDrawer } from "./CartDrawer";
import { useUIStore } from "@/lib/stores/ui";

export function GlobalCartDrawer() {
  const { isCartOpen, setIsCartOpen } = useUIStore();

  return (
    <CartDrawer
      visible={isCartOpen}
      onClose={() => setIsCartOpen(false)}
    />
  );
}