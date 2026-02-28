"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useQuoteCart } from "@/lib/store/quoteCart";

export default function QuoteCartPage() {
  const items = useQuoteCart((state) => state.items);
  const totalQty = useQuoteCart((state) => state.totalQty);
  const setQty = useQuoteCart((state) => state.setQty);
  const removeItem = useQuoteCart((state) => state.removeItem);
  const clearCart = useQuoteCart((state) => state.clearCart);

  return (
    <main className="min-h-screen bg-neutral-50 pt-28 pb-14">
      <section className="container-wide">
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">
              Quote Cart
            </p>
            <h1 className="text-3xl font-light text-neutral-900">Your Selected Products</h1>
            <p className="mt-2 text-sm text-neutral-600">
              {totalQty} item{totalQty === 1 ? "" : "s"} selected for your quote.
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 hover:text-neutral-900"
            >
              Clear All
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center">
            <p className="text-base text-neutral-700">Your quote cart is empty.</p>
            <Link
              href="/products"
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            <div className="space-y-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[5.5rem_1fr] gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:grid-cols-[7rem_1fr]"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-neutral-100 sm:h-24 sm:w-24">
                    <Image
                      src={item.image || "/images/fallback/category.webp"}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div>
                    <Link
                      href={item.href || "/products"}
                      className="text-sm font-semibold text-neutral-900 hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          className="inline-flex h-9 w-9 items-center justify-center text-neutral-700 hover:text-primary"
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-9 text-center text-sm font-semibold text-neutral-900">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="inline-flex h-9 w-9 items-center justify-center text-neutral-700 hover:text-primary"
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="rounded-2xl border border-neutral-200 bg-white p-5 h-fit">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                Quote Summary
              </p>
              <p className="mt-3 text-sm text-neutral-700">
                Selected quantity: <strong>{totalQty}</strong>
              </p>
              <p className="mt-2 text-sm text-neutral-700">
                Unique products: <strong>{items.length}</strong>
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-primary/90"
              >
                Submit Quote Request
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

