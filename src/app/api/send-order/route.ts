import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { updateProductStatus } from '../../../lib/products';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const { name, email, phone, products, total } = await req.json();

  if (!name || !email || !phone || !products || !total) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // Mark products as sold in Supabase
  for (const p of products) {
    try {
      await updateProductStatus(p.id, 'vendido', email);
    } catch (err) {
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

  const productList = products.map((p: any) =>
    `- [${p.id}] ${p.title} (${p.brand}${p.size ? ' - ' + p.size : ''}) - ${p.price}`
  ).join('\n');

  const orderDetails = `
Pedido de Feria Americana Valeria\n\n
Nombre comprador: ${name}\nEmail comprador: ${email}\nTeléfono: ${phone}\n\nProductos:\n${productList}\n\nTotal: $${total.toLocaleString()}
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
  } catch (err) {
    return NextResponse.json({ error: 'No se pudo enviar el email.' }, { status: 500 });
  }
} 