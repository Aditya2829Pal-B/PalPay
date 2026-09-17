import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Wallet, QrCode } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_SPENDING_DATA = [
  { month: 'Jan', amount: 150 },
  { month: 'Feb', amount: 230 },
  { month: 'Mar', amount: 180 },
  { month: 'Apr', amount: 290 },
  { month: 'May', amount: 210 },
  { month: 'Jun', amount: 340 },
];

interface Props {
  onExit: () => void;
}

export default function P2PTransferScreen({ onExit }: Props) {
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');

  // Generate a mock payment link (e.g., abpay://transfer?wallet=...&amount=...)
  const paymentLink = `abpay://transfer?wallet=${encodeURIComponent(walletAddress)}&amount=${encodeURIComponent(amount)}`;
  const isValid = walletAddress.trim().length > 0 && Number(amount) > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-6 font-sans">
      <header className="w-full max-w-xl flex items-center mb-8">
        <button onClick={onExit} className="text-slate-500 hover:text-slate-800 font-medium transition-colors flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </header>

      <main className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <QrCode className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">P2P QR Generator</h1>
        </div>

        <p className="text-slate-500 mb-8">
          Generate a unique QR code to request peer-to-peer transfers instantly.
        </p>

        <div className="space-y-5 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 block">Wallet Address (ABpay ID)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Wallet className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="e.g. 0x1234... or user@abpay"
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 block">Requested Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 font-medium">$</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-8 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
          {isValid ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                <QRCodeSVG 
                  value={paymentLink} 
                  size={200}
                  level="H"
                  includeMargin={false}
                  fgColor="#0f172a" // slate-900
                />
              </div>
              <p className="text-sm font-medium text-slate-500 text-center break-all max-w-[250px]">
                {paymentLink}
              </p>
            </div>
          ) : (
            <div className="w-[200px] h-[200px] border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
              <QrCode className="w-8 h-8 opacity-50" />
              <span className="text-sm font-medium text-center px-4">Enter details to generate QR</span>
            </div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <h2 className="text-lg font-bold tracking-tight mb-4 text-slate-700">Monthly Spending Trends</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_SPENDING_DATA}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
