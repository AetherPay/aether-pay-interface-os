import React from 'react';
import { CreditCard, Smartphone, Waves } from 'lucide-react';

export const fmtVolume = (v: number): string =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000 ? `${(v / 1_000).toFixed(0)}k`
  : String(Math.round(v));

export const METHOD_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  card:         { label: 'Visa / Mastercard', color: '#6366f1', bg: 'bg-indigo-100 text-indigo-600', icon: <CreditCard size={12} /> },
  stripe:       { label: 'Visa / Mastercard', color: '#6366f1', bg: 'bg-indigo-100 text-indigo-600', icon: <CreditCard size={12} /> },
  mtn_money:    { label: 'MTN MoMo',          color: '#f59e0b', bg: 'bg-amber-100 text-amber-600',   icon: <Smartphone size={12} /> },
  orange_money: { label: 'Orange Money',      color: '#f97316', bg: 'bg-orange-100 text-orange-600', icon: <Smartphone size={12} /> },
  wave:         { label: 'Wave',              color: '#10b981', bg: 'bg-emerald-100 text-emerald-600', icon: <Waves size={12} /> },
  usdc:         { label: 'USDC',              color: '#3b82f6', bg: 'bg-blue-100 text-blue-600',     icon: <CreditCard size={12} /> },
};

export const TX_STATUS: Record<string, { label: string; cls: string }> = {
  completed: { label: 'Complété', cls: 'bg-green-100 text-green-700' },
  failed:    { label: 'Échoué',   cls: 'bg-red-100 text-red-700' },
  pending:   { label: 'En cours', cls: 'bg-amber-100 text-amber-700' },
};
