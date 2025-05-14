"use client";
import Link from 'next/link';
import { useCart } from '@/app/cart-context';
import { Button } from './button';
import { ShoppingCart } from 'lucide-react';

export default function CartButton() {
  const { cartItems } = useCart();
  return (
    <Link href="/cart">
      <Button variant="outline" size="icon" className="relative">
        <ShoppingCart className="w-6 h-6" />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
            {cartItems.length}
          </span>
        )}
      </Button>
    </Link>
  );
} 