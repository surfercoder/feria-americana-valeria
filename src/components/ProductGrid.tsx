"use client";
import { useState, useEffect, useRef } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "../app/cart-context";
import type { Product } from "@/lib/products";

const SOLD_STATUSES = ["vendido", "sold", "vendido ", "vendida", "vendida "];
const SKELETON_COUNT = 16;
const COLUMN_COUNT = 4;
const ROW_HEIGHT = 480;

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-gray-100 rounded-lg h-[400px] w-full flex flex-col" />
  );
}

function getColumnCount() {
  if (typeof window === 'undefined') return COLUMN_COUNT;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return COLUMN_COUNT;
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const { cartItems, addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1280); // default
  const [columnCount, setColumnCount] = useState(() => {
    if (typeof window === 'undefined') return COLUMN_COUNT;
    return getColumnCount();
  });
  const [gridHeight, setGridHeight] = useState(() => {
    if (typeof window === 'undefined') return 800;
    return window.innerHeight * 0.8;
  });
  // Hydration fix: only render grid after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Responsive: update container width on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (gridRef.current) {
        setContainerWidth(gridRef.current.offsetWidth);
      } else {
        // Use max width for desktop
        setContainerWidth(Math.min(window.innerWidth, 1280));
      }
      setColumnCount(getColumnCount());
      setGridHeight(window.innerHeight * 0.8);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (gridRef.current) {
      setContainerWidth(gridRef.current.offsetWidth);
    } else {
      setContainerWidth(Math.min(window.innerWidth, 1280));
    }
  }, [gridRef, columnCount]);

  useEffect(() => {
    if (products && products.length > 0) setIsLoading(false);
  }, [products]);

  // Calculate card width to fill columns across the container (with gap), but clamp to max 480px
  // const gap = ; // px, matches padding: 4px per card, half the previous value
  let cardWidth = Math.floor((containerWidth - (columnCount + 1)) / columnCount);
  cardWidth = Math.min(cardWidth, 480);
  // Calculate the actual grid width for perfect centering
  const actualGridWidth = cardWidth * columnCount + (columnCount + 1);

  const rowCount = isLoading
    ? Math.ceil(SKELETON_COUNT / columnCount)
    : Math.ceil(products.length / columnCount);

  if (!mounted) return <div style={{ height: 800 }} />;

  const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (isLoading) {
      return (
        <div style={{ ...style, width: cardWidth, padding: 8 }}>
          <SkeletonCard />
        </div>
      );
    }
    if (index >= products.length) return null;
    const product: Product = products[index];
    const isSold = SOLD_STATUSES.includes((product.status ?? '').trim().toLowerCase());
    const isInCart = cartItems.includes(product.id);
    return (
      <div style={{ ...style, width: cardWidth, maxWidth: 480, padding: 4 }}>
        <Card className="flex flex-col h-full">
          <CardHeader className="relative p-0 h-56 flex items-center justify-center">
            <Link href={`/product/${product.id}`} scroll={false}>
              <div className="w-full h-56 flex items-center justify-center">
                <picture className="block w-full h-full">
                  <source srcSet={`/images/${product.image.replace(/\.jpe?g$/i, '.webp')}`} type="image/webp" />
                  <Image
                    src={`/images/${product.image}`}
                    alt={product.title}
                    width={400}
                    height={400}
                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                    className="rounded-lg w-full h-full"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    placeholder="blur"
                    blurDataURL="data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAAAwAQCdASoEAAQAAVAfJZgCdAEOkAQA"
                  />
                </picture>
              </div>
            </Link>
            {isSold && (
              <span
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-8 py-1 rounded font-bold tracking-wide uppercase z-10 shadow-lg"
                style={{ transform: 'translateX(-50%) rotate(-45deg)' }}
              >
                VENDIDO
              </span>
            )}
          </CardHeader>
          <CardContent className="flex flex-col flex-1 p-2 pt-1 justify-between">
            <CardTitle className="text-lg font-semibold mb-1 mt-1 text-center">
              {product.title}
              {product.color && (
                <span className="text-gray-500"> ({product.color})</span>
              )}
            </CardTitle>
            <div className="text-sm text-gray-500 mb-1 text-center">{product.brand} {product.size && `- ${product.size}`}</div>
            <div className="text-sm mb-1 text-center">{product.description}</div>
            <div className="text-base font-bold mb-2 text-center">$ {product.price}</div>
            <Button
              disabled={isSold || isInCart}
              className="w-full mt-auto"
              onClick={() => addToCart(product.id)}
            >
              {isInCart ? 'Agregado' : 'Comprar'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full flex justify-center">
      <div ref={gridRef} style={{ width: actualGridWidth }}>
        <Grid
          columnCount={columnCount}
          columnWidth={cardWidth}
          height={gridHeight}
          rowCount={rowCount}
          rowHeight={ROW_HEIGHT}
          width={actualGridWidth}
        >
          {Cell}
        </Grid>
      </div>
    </div>
  );
} 