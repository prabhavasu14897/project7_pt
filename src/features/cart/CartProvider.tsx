"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { journey, useJourney } from "@/features/journey/store";

interface CartContextValue {
  /** Total units across all lines. */
  count: number;
  has: (id: string) => boolean;
  /** Adds `quantity` units (default 1), optionally from a chosen pharmacy. */
  add: (id: string, quantity?: number, pharmacyId?: string) => void;
  /** The pharmacy a line is fulfilled by, when one was chosen. */
  pharmacyFor: (id: string) => string | undefined;
  remove: (id: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Cart API for screens; lines live in the journey store so they survive navigation, refresh and checkout. */
export function CartProvider({ children }: { children: ReactNode }) {
  const { cart } = useJourney();

  const value = useMemo<CartContextValue>(
    () => ({
      count: Object.values(cart).reduce((sum, line) => sum + line.quantity, 0),
      has: (id) => (cart[id]?.quantity ?? 0) > 0,
      pharmacyFor: (id) => cart[id]?.pharmacyId,
      add: (id, quantity = 1, pharmacyId) => journey.addToCart({ medicineId: id, quantity, pharmacyId }),
      remove: (id) => journey.removeFromCart(id),
    }),
    [cart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
