import { getProductById, getAllProducts } from '@/lib/products';
import Image from 'next/image';
import CloseModalButton from './CloseModalButton';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ id: String(product.id) }));
}

export default async function ProductModal({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative flex items-center justify-center w-full h-full">
        <CloseModalButton />
        <picture className="block w-full h-full flex items-center justify-center">
          <source srcSet={`/images/${product.image.replace(/\.jpe?g$/i, '.webp')}`} type="image/webp" />
          <Image
            src={`/images/${product.image}`}
            alt={product.title}
            width={1200}
            height={1200}
            style={{ objectFit: 'contain' }}
            className="rounded-lg max-w-[95vw] max-h-[80vh] w-auto h-auto shadow-xl"
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAAAwAQCdASoEAAQAAVAfJZgCdAEOkAQA"
            priority
          />
        </picture>
      </div>
    </div>
  );
} 