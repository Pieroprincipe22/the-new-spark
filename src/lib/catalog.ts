import {
  products as fallbackProducts,
  services as fallbackServices,
  type Product,
  type Service,
} from "@/data/catalog";
import { supabase } from "@/lib/supabase/client";

type ServiceRow = {
  slug: string;
  name: string;
  description: string;
  price: number | string;
  duration_minutes: number;
};

type ProductRow = {
  slug: string;
  name: string;
  description: string;
  price: number | string | null;
  price_label: string;
  stock: number;
  image_url: string | null;
};

function formatEuroPrice(value: number | string | null) {
  if (value === null) {
    return "Consultar";
  }

  const numericValue =
    typeof value === "string" ? Number.parseFloat(value) : value;

  if (Number.isNaN(numericValue)) {
    return "Consultar";
  }

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(numericValue);
}

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("slug, name, description, price, duration_minutes")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    return fallbackServices;
  }

  return (data as ServiceRow[]).map((service) => ({
    id: service.slug,
    name: service.name,
    description: service.description,
    price: formatEuroPrice(service.price),
    priceNumber:
      typeof service.price === "string"
        ? Number.parseFloat(service.price)
        : service.price,
    durationMinutes: service.duration_minutes,
  }));
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("slug, name, description, price, price_label, stock, image_url")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    return fallbackProducts;
  }

  return (data as ProductRow[]).map((product) => ({
    id: product.slug,
    name: product.name,
    description: product.description,
    price: product.price ? formatEuroPrice(product.price) : product.price_label,
    available: product.stock > 0,
    imageUrl: product.image_url ?? undefined,
    imageAlt: product.name,
  }));
}