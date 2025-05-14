import { getAllProducts } from '../../lib/products';
import ProductGrid from '../components/ProductGrid';

export default async function Home() {
  const products = await getAllProducts();
  return (
    <main className="container mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold mb-8 text-center">Feria Americana Valeria</h1>
      <ProductGrid products={products} />
    </main>
  );
}
