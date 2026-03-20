import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TIMEZONE = "America/Caracas"

export function formatDate(date: Date | string | number) {
  return new Date(date).toLocaleDateString("es-ES", {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function formatDateTime(date: Date | string | number) {
  return new Date(date).toLocaleString("es-ES", {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatTime(date: Date | string | number) {
  return new Date(date).toLocaleTimeString("es-ES", {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit'
  })
}
