import Link from 'next/link';

export default function ThanksPage() {
  return (
    <main className="container mx-auto py-16 px-4 text-center">
      <h1 className="text-3xl font-bold mb-6">¡Gracias por tu compra!</h1>
      <p className="mb-8 text-lg">Pronto me pondré en contacto contigo para coordinar la entrega y el pago. ¡Gracias por confiar en Feria Americana de Valeria!</p>
      <Link href="/">
        <button className="bg-black text-white px-6 py-3 rounded font-semibold hover:bg-gray-800 transition">Volver a la tienda</button>
      </Link>
    </main>
  );
} 