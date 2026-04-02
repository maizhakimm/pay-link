"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import {
  Plus,
  Copy,
  Share2,
  Pencil,
  Trash2,
  Search,
  Package2,
  Eye,
  EyeOff,
  ExternalLink,
  ImageIcon,
} from "lucide-react";

type Product = {
  id: string;
  seller_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  price?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  image_urls?: string[] | null;
  public_visibility?: boolean | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function formatMoney(amount?: number | null) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function getPublicProductUrl(slug: string) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/p/${slug}`;
  }
  return `/p/${slug}`;
}

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function fetchProducts() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProducts([]);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        return;
      }

      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error("Unexpected error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleCopy(url: string, productId: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(productId);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Unable to copy link.");
    }
  }

  async function handleShare(product: Product) {
    const url = getPublicProductUrl(product.slug);

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard.");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  }

  async function handleToggleActive(product: Product) {
    const nextValue = !product.is_active;

    try {
      setActionLoadingId(product.id);

      const { error } = await supabase
        .from("products")
        .update({ is_active: nextValue })
        .eq("id", product.id);

      if (error) {
        console.error("Toggle active error:", error);
        alert("Failed to update product status.");
        return;
      }

      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, is_active: nextValue } : item
        )
      );
    } catch (error) {
      console.error("Unexpected toggle error:", error);
      alert("Something went wrong.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(product.id);

      const { error } = await supabase.from("products").delete().eq("id", product.id);

      if (error) {
        console.error("Delete error:", error);
        alert("Failed to delete product.");
        return;
      }

      setProducts((prev) => prev.filter((item) => item.id !== product.id));
    } catch (error) {
      console.error("Unexpected delete error:", error);
      alert("Something went wrong.");
    } finally {
      setActionLoadingId(null);
    }
  }

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter((product) => {
      const text = [
        product.name,
        product.slug,
        product.description,
        product.is_active ? "active" : "inactive",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [products, search]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Dashboard</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Products
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage your pay-link products, images, visibility, and generated URLs.
            </p>
          </div>

          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, slug, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          <div className="text-sm text-slate-500">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Package2 className="h-6 w-6 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No products yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Create your first product and start sharing your pay-link.
          </p>
          <div className="mt-5">
            <Link
              href="/dashboard/products/new"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add Product
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredProducts.map((product) => {
            const publicUrl = getPublicProductUrl(product.slug);
            const firstImage = product.image_urls?.[0] || null;
            const isBusy = actionLoadingId === product.id;

            return (
              <div
                key={product.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      {firstImage ? (
                        <Image
                          src={firstImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-bold text-slate-900">
                            {product.name}
                          </h2>

                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {formatMoney(product.price)}
                          </p>

                          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                            {product.description || "No description added yet."}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.is_active
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Generated URL
                      </p>

                      <Link
                        href={publicUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-slate-900"
                      >
                        Open
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="mt-2 break-all rounded-xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                      {publicUrl}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCopy(publicUrl, product.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedId === product.id ? "Copied" : "Copy"}
                      </button>

                      <button
                        onClick={() => handleShare(product)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </button>

                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleToggleActive(product)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {product.is_active ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          Set Inactive
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          Set Active
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(product)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
