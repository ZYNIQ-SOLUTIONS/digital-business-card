"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Copy, Check, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function SignatureGeneratorPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadCard() {
      const { data } = await supabase
        .from("cards")
        .select("*")
        .eq("id", params.id)
        .single();
      
      if (data) {
        setCard(data);
      }
      setLoading(false);
    }
    loadCard();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0071E3]" />
      </div>
    );
  }

  if (!card) {
    return <div className="p-8 text-center">Card not found.</div>;
  }

  const cardUrl = typeof window !== "undefined" ? `${window.location.origin}/${card.slug}` : `https://d-b-c.netlify.app/${card.slug}`;

  const signatureHtml = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';">
  <tr>
    <td style="padding-right: 16px; border-right: 2px solid #E5E5EA;">
      <a href="${cardUrl}" target="_blank" style="text-decoration: none;">
        <img src="${card.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(card.full_name || 'Card')}&background=0071E3&color=fff&size=200&bold=true&format=svg`}" alt="${card.full_name}" width="80" height="80" style="border-radius: 50%; display: block;" />
      </a>
    </td>
    <td style="padding-left: 16px;">
      <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #1D1D1F;">${card.full_name}</h3>
      <p style="margin: 0 0 2px 0; font-size: 13px; font-weight: 500; color: #0071E3;">${card.title} ${card.company ? `at ${card.company}` : ''}</p>
      ${card.phone_primary ? `<p style="margin: 0 0 2px 0; font-size: 12px; color: #86868B;">📞 ${card.phone_primary}</p>` : ''}
      <p style="margin: 6px 0 0 0;">
        <a href="${cardUrl}" target="_blank" style="font-size: 12px; font-weight: 600; color: #0071E3; text-decoration: none; padding: 4px 10px; border-radius: 12px; background-color: #F5F5F7; display: inline-block;">View Smart Card</a>
      </p>
    </td>
  </tr>
</table>
  `.trim();

  const handleCopyRichText = () => {
    const blob = new Blob([signatureHtml], { type: "text/html" });
    const clipboardItem = new window.ClipboardItem({ "text/html": blob });
    navigator.clipboard.write([clipboardItem]).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(signatureHtml).then(() => {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/cards/${card.id}`}
          className="p-2 hover:bg-black/5 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Email Signature</h1>
          <p className="text-sm text-[#86868B]">Generate a professional signature linked to your smart card.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm">
            <h2 className="text-sm font-semibold mb-4 text-[#1D1D1F]">Preview</h2>
            <div 
              className="p-6 bg-white border border-gray-200 rounded-xl"
              dangerouslySetInnerHTML={{ __html: signatureHtml }}
            />
          </div>

          <div className="bg-[#FBFBFD] rounded-3xl p-6 border border-black/[0.06]">
            <h3 className="text-sm font-bold text-[#1D1D1F] mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0071E3]" />
              Instructions
            </h3>
            <ul className="text-xs text-[#86868B] space-y-2 ml-4 list-disc">
              <li>For <strong>Gmail / Apple Mail / Outlook (Web)</strong>: Click "Copy Signature (Rich Text)" and paste it directly into your signature settings.</li>
              <li>For some custom email clients: Copy the raw HTML code.</li>
              <li>The signature automatically links back to your live digital business card.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCopyRichText}
            className="w-full py-4 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-2xl font-semibold shadow-sm transition flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            <span>{copied ? "Copied!" : "Copy Signature (Rich Text)"}</span>
          </button>

          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm mt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#1D1D1F]">Raw HTML Code</h2>
              <button
                onClick={handleCopyCode}
                className="text-xs font-semibold text-[#0071E3] flex items-center gap-1 hover:underline"
              >
                {copiedHtml ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedHtml ? "Copied" : "Copy Code"}
              </button>
            </div>
            <pre className="bg-[#F5F5F7] p-4 rounded-xl text-[10px] text-[#1D1D1F] overflow-x-auto border border-black/[0.04]">
              <code>{signatureHtml}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
