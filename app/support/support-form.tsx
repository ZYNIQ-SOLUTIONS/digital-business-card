'use client';

import React, { useState, useTransition } from 'react';
import { submitSupportTicket, SubmitTicketState } from './actions';
import { Send, CheckCircle2, AlertCircle, Loader2, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';

const CATEGORIES = [
  { value: 'general', label: 'General Inquiry / Question' },
  { value: 'nfc_card', label: 'NFC Card Order & Delivery' },
  { value: 'wallet_pass', label: 'Apple / Samsung Wallet Pass' },
  { value: 'enterprise', label: 'Enterprise & Team Solutions' },
  { value: 'billing', label: 'Billing & Payment Support' },
  { value: 'technical', label: 'Technical Issue / Bug Report' },
  { value: 'privacy', label: 'Privacy & Data Protection' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low - General question', color: 'border-gray-200 text-gray-700 hover:border-gray-300' },
  { value: 'medium', label: 'Medium - Standard assistance', color: 'border-blue-200 text-blue-700 hover:border-blue-300' },
  { value: 'high', label: 'High - Urgent order/pass issue', color: 'border-orange-200 text-orange-700 hover:border-orange-300' },
  { value: 'urgent', label: 'Urgent - Critical business blocker', color: 'border-red-200 text-red-700 hover:border-red-300' },
];

export function SupportForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitTicketState | null>(null);
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('general');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('priority', priority);
    formData.set('category', category);

    startTransition(async () => {
      const res = await submitSupportTicket(null, formData);
      setResult(res);
    });
  }

  function handleReset() {
    setResult(null);
    setPriority('medium');
    setCategory('general');
  }

  if (result?.success) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-100">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-mono mb-3">
          Reference ID: <strong className="font-semibold text-gray-900">{result.ticketNumber}</strong>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          Support Ticket Received!
        </h3>
        
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Thank you for reaching out. Our support engineering team has logged your inquiry under ticket <strong className="text-gray-900">{result.ticketNumber}</strong>. You will receive an email confirmation and updates shortly.
        </p>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 max-w-md mx-auto mb-8 text-left text-xs text-gray-600 space-y-1.5">
          <p className="font-semibold text-gray-900">What happens next?</p>
          <p>• Our team reviews tickets in the order they are received.</p>
          <p>• Standard response time is within <strong>2 to 4 hours</strong> during working hours (9 AM - 7 PM GST).</p>
          <p>• Urgent inquiries are escalated automatically to on-call specialists.</p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Open a Support Ticket</h3>
          <p className="text-xs text-gray-500">Fill in the details below and our team will get back to you promptly.</p>
        </div>
      </div>

      {result?.error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{result.error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Ibrahim Zaki"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. ibrahim@company.com"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            />
          </div>
        </div>

        {/* Phone & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Phone Number <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="e.g. +971 50 123 4567"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Priority Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRIORITIES.map((p) => {
              const active = priority === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                    active
                      ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {p.label.split(' - ')[0]}
                  <span className="block text-[10px] opacity-75 mt-0.5 truncate">
                    {p.label.split(' - ')[1]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            required
            placeholder="Brief summary of your question or issue"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Detailed Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Please provide any relevant details, order numbers, pass links, or steps to reproduce the issue..."
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-y"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Ticket...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Support Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
