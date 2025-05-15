import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { updateProductStatus } from '../../../lib/products';
import { revalidatePath } from 'next/cache';
import type { Product } from '@/lib/products';


export async function POST(req: NextRequest) {
  const { name, email, phone, products, total } = await req.json();

  if (!name || !email || !phone || !products || !total) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // Mark products as sold in Supabase
  for (const p of products) {
    try {
      await updateProductStatus(p.id, 'vendido', email);
    } catch {
      return NextResponse.json({ error: `No se pudo actualizar el producto ${p.id}` }, { status: 500 });
    }
  }

  // Revalidate the root route so the homepage shows updated product statuses
  revalidatePath('/');

  // Configure nodemailer (use your SMTP or a service like Gmail, Resend, etc.)
  const transporter = nodemailer.createTransport({
    auth: {
      pass: process.env.GOOGLE_APP_PASSWORD,
      user: process.env.EMAIL_SENDER,
    },
    service: 'gmail',
  });

  const valeriaEmail = process.env.EMAIL_RECIPIENT; // TODO: Replace with real email

  const productList = products.map((p: Product) =>
    `- [${p.id}] ${p.title} (${p.brand}${p.size ? ' - ' + p.size : ''}) - ${p.price}`
  ).join('\n');

  // Format WhatsApp link
  const phoneDigits = String(phone).replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${phoneDigits}`;

  const orderDetails = `
Pedido de Feria Americana Valeria\n\n
Nombre comprador: ${name}\nEmail comprador: ${email}\nWhatsApp: ${whatsappLink}\n\nProductos:\n${productList}\n\nTotal: $${total.toLocaleString()}
\nNota: Tu compra será reservada por 48 horas para coordinar el pago y retiro/entrega. Muchas gracias!
`;

  try {
    // Send to Valeria
    await transporter.sendMail({
      from: 'Feria Americana <no-reply@feriavaleria.com>',
      to: valeriaEmail,
      subject: 'Nuevo pedido recibido',
      text: orderDetails,
    });
    // Send to buyer
    await transporter.sendMail({
      from: 'Feria Americana <no-reply@feriavaleria.com>',
      to: email,
      subject: 'Confirmación de tu pedido',
      text: `¡Gracias por tu compra!\n\n${orderDetails}`,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudo enviar el email.' }, { status: 500 });
  }
} 