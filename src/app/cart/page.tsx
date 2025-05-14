"use client";
import { useCart } from '../cart-context';
import { getAllProducts, Product } from '../../../lib/products';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();
  useEffect(() => {
    getAllProducts().then(setProducts);
  }, []);
  const cartProducts = products.filter((p) => cartItems.includes(p.id));
  const total = cartProducts.reduce((sum, p) => {
    const price = Number(p.price.replace(/[^\d]/g, '')) || 0;
    return sum + price;
  }, 0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const orderSchema = z.object({
    name: z.string().min(2, 'Por favor ingresa tu nombre.'),
    email: z.string().email('Por favor ingresa un email válido.'),
    phone: z.string().min(6, 'Por favor ingresa un teléfono válido.'),
  });

  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  if (cartProducts.length === 0) {
    return (
      <main className="container mx-auto py-8 px-2 text-center">
        <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
        <Link href="/">
          <Button>Volver a la tienda</Button>
        </Link>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const result = orderSchema.safeParse({ name, email, phone });
    if (!result.success) {
      const errors: { name?: string; email?: string; phone?: string } = {};
      for (const err of result.error.errors) {
        errors[err.path[0] as 'name' | 'email' | 'phone'] = err.message;
      }
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          products: cartProducts,
          total,
        }),
      });
      if (!res.ok) throw new Error('No se pudo enviar el pedido.');
      clearCart();
      setShowCheckout(false);
      setName('');
      setEmail('');
      setPhone('');
      if (formRef.current) formRef.current.reset();
      router.push('/thanks');
    } catch (err) {
      setError('Hubo un error al enviar el pedido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field: 'name' | 'email' | 'phone') => {
    const result = orderSchema.safeParse({ name, email, phone });
    if (!result.success) {
      const error = result.error.errors.find(e => e.path[0] === field);
      setFieldErrors(prev => ({ ...prev, [field]: error ? error.message : undefined }));
    } else {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <main className="container mx-auto py-8 px-2">
      <h1 className="text-2xl font-bold mb-6 text-center">Carrito de compras</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cartProducts.map((product) => (
          <Card key={product.id} className="flex flex-col h-full">
            <CardHeader className="relative p-0 h-48 bg-gray-100 flex items-center justify-center">
              <Image
                src={`/images/${product.image}`}
                alt={product.title}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-t-lg"
                sizes="(max-width: 768px) 100vw, 33vw"
                unoptimized
              />
            </CardHeader>
            <CardContent className="flex flex-col flex-1 p-4">
              <CardTitle className="text-lg font-semibold mb-1">{product.title}</CardTitle>
              <div className="text-sm text-gray-500 mb-2">{product.brand} {product.size && `- ${product.size}`}</div>
              <div className="text-base font-bold mb-2">{product.price}</div>
              <Button variant="destructive" onClick={() => removeFromCart(product.id)} className="mt-auto w-full">Eliminar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="text-xl font-bold">Total: $ {total.toLocaleString()}</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearCart}>Vaciar carrito</Button>
          <Button onClick={() => setShowCheckout(true)}>Finalizar compra</Button>
        </div>
      </div>
      {showCheckout && (
        <div className="max-w-md mx-auto bg-white rounded shadow p-6 mt-8">
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold mb-2 text-center">Datos para el pedido</h2>
            <input
              type="text"
              placeholder="Tu nombre"
              className="border rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => handleBlur('name')}
            />
            {fieldErrors.name && <div className="text-red-600 text-sm text-left">{fieldErrors.name}</div>}
            <input
              type="email"
              placeholder="Tu email"
              className="border rounded px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
            />
            {fieldErrors.email && <div className="text-red-600 text-sm text-left">{fieldErrors.email}</div>}
            <input
              type="tel"
              placeholder="Tu teléfono"
              className="border rounded px-3 py-2"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onBlur={() => handleBlur('phone')}
            />
            {fieldErrors.phone && <div className="text-red-600 text-sm text-left">{fieldErrors.phone}</div>}
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <Button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar pedido'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowCheckout(false)}>Cancelar</Button>
          </form>
        </div>
      )}
    </main>
  );
} 