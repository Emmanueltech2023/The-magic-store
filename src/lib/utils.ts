import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price).replace("NGN", "₦");
}

// --- Original Link Generators (Restored to fix Vite errors) ---

export function getWhatsAppLink(productName: string, price: number) {
  const message = `Hi, I want to order ${productName} (${formatPrice(price)})`;
  return `https://wa.me/2347000000000?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppCartLink(items: { name: string; price: number; quantity: number }[], total: number) {
  const itemSummary = items.map(i => `- ${i.name} (${i.quantity}x) @ ${formatPrice(i.price)}`).join("\n");
  const message = `Hi, I want to place an order:\n\n${itemSummary}\n\nTotal: ${formatPrice(total)}`;
  return `https://wa.me/2347000000000?text=${encodeURIComponent(message)}`;
}

// --- New Tracking Handlers ---

export async function handleWhatsAppOrder(productName: string, price: number) {
  console.log("Attempting to track order for:", productName);

  const { data, error } = await supabase.from('orders').insert([{
    product_name: productName,
    amount: price,
    status: 'pending'
  }]);

  if (error) {
    // If this logs, it will tell us EXACTLY why it failed (e.g., "Policy violation")
    console.error("Supabase Insert Error:", error.message);
  } else {
    console.log("Order logged successfully!");
  }

  // Redirect to WhatsApp
  window.open(getWhatsAppLink(productName, price), '_blank');
}

export async function handleWhatsAppCartCheckout(items: { name: string; price: number; quantity: number }[], total: number) {
  try {
    const itemNames = items.map(i => `${i.quantity}x ${i.name}`).join(", ");
    await supabase.from('orders').insert([{
      product_name: `Cart: ${itemNames}`,
      amount: total,
      status: 'pending'
    }]);
  } catch (err) {
    console.error("Tracking failed:", err);
  }
  window.open(getWhatsAppCartLink(items, total), '_blank');
}