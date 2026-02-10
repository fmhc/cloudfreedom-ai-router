import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return 'N/A'
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
  }).format(parsed)
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return 'N/A'
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("de-DE").format(num)
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function generateApiKey(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

