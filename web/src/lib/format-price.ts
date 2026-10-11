export const formatPrice = (value: number): string => `₹${value.toLocaleString("en-IN")}`;

export const formatPaise = (value: number): string => formatPrice(value / 100);
