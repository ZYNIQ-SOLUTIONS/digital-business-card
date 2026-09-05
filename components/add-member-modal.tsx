"use client";

import React, { useState } from "react";
import { UserPlus, Mail, Phone, Building, Briefcase, X, Loader2, Send, CheckCircle2 } from "lucide-react";
import { PhoneInput } from "@/components/phone-input";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddMemberModal({ isOpen, onClose, onAdded }: AddMemberModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("ZYNIQ");
  const [sendInvite, setSendInvite] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !title) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/enterprise/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          title,
          department,
          phone,
          company,
          sendInvite,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add member.");
      }

      setSuccess(true);
      setTimeout(() => {
        onAdded();
        onClose();
        setSuccess(false);
        setFullName("");
        setEmail("");
        setTitle("");
        setPhone("");
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while adding the member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl border border-black/[0.08] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-black/[0.06] flex items-center justify-between bg-[#FBFBFD]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center shadow-2xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1D1D1F]">Add Enterprise Member</h2>
              <p className="text-[11px] text-[#86868B]">Provision a digital business card and send onboarding email</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {success ? (
            <div className="text-center py-8 space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-green-50 text-[#34C759] mx-auto flex items-center justify-center border border-green-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#1D1D1F]">Member Added Successfully!</h3>
              <p className="text-xs text-[#86868B]">
                {sendInvite
                  ? `An email invitation was sent to ${email}.`
                  : "Card pass has been provisioned."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. VP of Product"
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR & People">HR &amp; People</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <PhoneInput
                    label="Phone Number"
                    value={phone}
                    onChange={setPhone}
                    placeholder="555 019 2834"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-1">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="ZYNIQ"
                    className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20"
                  />
                </div>
              </div>

              {/* Invite checkbox */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#0071E3]" />
                  <div>
                    <span className="text-xs font-semibold text-[#1D1D1F] block">Send Onboarding Email Invitation</span>
                    <span className="text-[10px] text-[#86868B]">Employee receives an official email to access and customize their card</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendInvite}
                  onChange={(e) => setSendInvite(e.target.checked)}
                  className="w-4 h-4 accent-[#0071E3] rounded cursor-pointer"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 rounded-2xl bg-[#F5F5F7] hover:bg-neutral-200 text-xs font-semibold text-[#1D1D1F] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Provisioning Pass &amp; Inviting...</span>
                    </>
                  ) : (
                    <>
                      <span>Add Member &amp; Provision Pass</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
