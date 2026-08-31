/* eslint-disable */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  UploadCloud, 
  Building2, 
  Users, 
  Loader2, 
  CheckCircle2, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Send, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  RefreshCw 
} from "lucide-react";
import { AddMemberModal } from "@/components/add-member-modal";
import { EditMemberModal } from "@/components/edit-member-modal";
import { VerifiedBadgeIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

interface Member {
  id: string;
  fullName: string;
  email: string;
  title: string;
  company: string;
  department: string;
  phone: string;
  role: string;
  status: string;
  slug: string;
  isVerified: boolean;
  theme: string;
  bio?: string;
  viewsCount: number;
}

export default function EnterpriseDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [brandLock, setBrandLock] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const supabase = createClient();

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  // CSV Upload States
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchOrgSettings();
  }, []);

  const fetchOrgSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from("organization_members")
      .select("org_id, organizations(brand_lock)")
      .eq("user_id", user.id)
      .single();
      
    if (data) {
      setOrgId(data.org_id);
      const org = data.organizations as any;
      if (org) {
        setBrandLock(org.brand_lock || false);
      }
    }
  };

  const toggleBrandLock = async () => {
    if (!orgId) return;
    const newValue = !brandLock;
    setBrandLock(newValue);
    await supabase.from("organizations").update({ brand_lock: newValue }).eq("id", orgId);
  };

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/enterprise/members");
      const data = await res.json();
      if (data.members) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error("Failed to fetch enterprise members:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("csv", file);

    try {
      const res = await fetch("/api/enterprise/bulk-upload", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        setCsvSuccess(true);
        setFile(null);
        fetchMembers();
      } else {
        alert("Failed to upload CSV.");
      }
    } catch {
      alert("Error uploading CSV.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleResendInvite = async (email: string, id: string) => {
    setResendingId(id);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setResendSuccess(id);
        setTimeout(() => setResendSuccess(null), 2500);
      }
    } catch (err) {
      console.error("Failed to resend invite:", err);
    } finally {
      setResendingId(null);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the enterprise directory?`)) return;
    try {
      await fetch(`/api/enterprise/members?id=${id}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Delete member error:", err);
    }
  };

  // Filtered members list
  const departments = useMemo(() => {
    const depts = new Set<string>();
    members.forEach((m) => depts.add(m.department || "Executive"));
    return ["All", ...Array.from(depts)];
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === "All" || m.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [members, searchQuery, selectedDept]);

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">
            Enterprise &amp; HR Management
          </h1>
          <p className="text-[15px] text-[#86868B] mt-1">
            Provision passes, invite employees 1-by-1, edit profiles, and manage corporate digital cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-black/[0.08] shadow-xs cursor-pointer hover:bg-neutral-50 transition">
            <input
              type="checkbox"
              checked={brandLock}
              onChange={toggleBrandLock}
              className="w-4 h-4 rounded text-[#0071E3] focus:ring-[#0071E3]"
            />
            <span className="text-xs font-bold text-[#1D1D1F]">Lock Brand Assets</span>
          </label>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member (1-by-1)</span>
          </button>
        </div>
      </div>

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">Total Company Passes</span>
            <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">{members.length}</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">Active Published</span>
            <h2 className="text-3xl font-bold tracking-tight text-[#34C759]">
              {members.filter((m) => m.status === "Active").length}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#34C759] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">Departments</span>
            <h2 className="text-3xl font-bold tracking-tight text-[#5856D6]">{departments.length - 1 || 1}</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5856D6] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CSV Bulk Uploader */}
      <div className="bg-white rounded-[32px] p-6 border border-black/[0.06] shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F]">Bulk Upload Employees (CSV)</h2>
              <p className="text-xs text-[#86868B]">
                Upload CSV with columns: <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800 font-mono">name, title, email, phone</code>
              </p>
            </div>
          </div>

          {csvSuccess ? (
            <div className="flex items-center gap-2 text-[#34C759] text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Uploaded successfully!</span>
              <button onClick={() => setCsvSuccess(false)} className="text-[#0071E3] underline ml-2">Upload more</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="text-xs text-neutral-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#0071E3] hover:file:bg-blue-100 cursor-pointer"
              />
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 transition cursor-pointer"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Bulk Generate</span>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Directory Table Section */}
      <div className="bg-white rounded-[32px] p-6 border border-black/[0.06] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#1D1D1F]">Corporate Employee Directory</h2>
            <span className="text-xs text-neutral-400 font-mono">({filteredMembers.length} members)</span>
          </div>

          {/* Search & Dept Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, title, email..."
                className="w-48 sm:w-60 px-3 py-1.5 pl-8 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5" />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs font-medium text-[#1D1D1F] focus:outline-none"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "All" ? "All Departments" : dept}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchMembers}
              className="p-2 rounded-xl bg-[#F5F5F7] hover:bg-neutral-200 text-neutral-600 transition"
              title="Refresh directory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] text-[#86868B] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 font-semibold">Employee</th>
                <th className="py-3 px-3 font-semibold">Role &amp; Department</th>
                <th className="py-3 px-3 font-semibold">Contact Email</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Actions (HR Controls)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-neutral-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0071E3]" />
                    <span>Loading directory...</span>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-neutral-400">
                    <p className="text-sm font-medium text-neutral-600">No members found</p>
                    <p className="text-xs text-neutral-400 mt-0.5">Click &quot;Add Member (1-by-1)&quot; or upload CSV to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[#FBFBFD] transition">
                    
                    {/* Employee Identity */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 border border-black/10 flex items-center justify-center font-bold text-xs text-[#1D1D1F] shrink-0">
                          {member.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-[#1D1D1F]">{member.fullName}</span>
                            {member.isVerified && (
                              <span title="AI Verified Profile">
                                <VerifiedBadgeIcon className="w-3.5 h-3.5 text-green-500" />
                              </span>
                            )}
                          </div>
                          <a
                            href={`/${member.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#0071E3] font-mono hover:underline flex items-center gap-0.5"
                          >
                            <span>/{member.slug}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td className="py-3 px-3">
                      <span className="block font-medium text-[#1D1D1F]">{member.title}</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-blue-50 text-[#0071E3] text-[10px] font-semibold">
                        {member.department || "Executive"}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-3 text-neutral-600">
                      <span className="block">{member.email || "No email"}</span>
                      {member.phone && <span className="text-[10px] text-neutral-400">{member.phone}</span>}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          member.status === "Active"
                            ? "bg-green-50 text-green-700 border border-green-200/60"
                            : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === "Active" ? "bg-green-500" : "bg-neutral-400"}`} />
                        <span>{member.status}</span>
                      </span>
                    </td>

                    {/* HR Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* Edit Member Modal Trigger */}
                        <button
                          type="button"
                          onClick={() => setEditingMember(member)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-[#0071E3] transition"
                          title="Edit Employee Profile (HR)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Resend Invite */}
                        <button
                          type="button"
                          onClick={() => handleResendInvite(member.email, member.id)}
                          disabled={resendingId === member.id}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-purple-600 transition disabled:opacity-50"
                          title="Resend Onboarding Invitation Email"
                        >
                          {resendingId === member.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : resendSuccess === member.id ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>

                        {/* Delete Member */}
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id, member.fullName)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                          title="Remove Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Member 1-by-1 Modal */}
      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={fetchMembers}
      />

      {/* Edit Member Profile Modal */}
      <EditMemberModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        onUpdated={fetchMembers}
        member={editingMember}
      />
    </div>
  );
}
