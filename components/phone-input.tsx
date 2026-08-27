"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Phone } from "lucide-react";
import { COUNTRIES, Country, stripLeadingZero, parsePhoneWithCountry } from "@/lib/countries";

interface PhoneInputProps {
  value: string;
  onChange: (fullPhoneNumber: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  label,
  placeholder = "555 019 2834",
  required = false,
  disabled = false,
  className = "",
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parsed = parsePhoneWithCountry(value);
  const [selectedCountry, setSelectedCountry] = useState<Country>(parsed.country);
  const [localNumber, setLocalNumber] = useState<string>(parsed.localNumber);

  // Sync internal state when parent value changes
  useEffect(() => {
    const nextParsed = parsePhoneWithCountry(value);
    setSelectedCountry(nextParsed.country);
    setLocalNumber(nextParsed.localNumber);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter countries by search query
  const filteredCountries = COUNTRIES.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.iso.toLowerCase().includes(q) ||
      c.dialCode.includes(q)
    );
  });

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");
    
    // Re-format full phone number
    const sanitized = stripLeadingZero(localNumber);
    if (sanitized) {
      onChange(`${country.dialCode} ${sanitized}`.trim());
    } else {
      onChange(country.dialCode);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Apply regex to strip leading zero(s) (e.g. 0612345678 -> 612345678)
    const sanitized = stripLeadingZero(raw);
    setLocalNumber(sanitized);

    if (sanitized) {
      onChange(`${selectedCountry.dialCode} ${sanitized}`.trim());
    } else {
      onChange("");
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[13px] font-medium text-neutral-600 dark:text-neutral-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center rounded-2xl bg-neutral-50 dark:bg-[#1C1C22] border border-black/[0.08] dark:border-white/10 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
        
        {/* Country Selector Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3.5 py-3 border-r border-black/[0.06] dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-l-2xl transition cursor-pointer text-sm select-none"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </button>

        {/* Local Number Input */}
        <div className="relative flex-1 flex items-center">
          <input
            type="tel"
            disabled={disabled}
            value={localNumber}
            onChange={handleNumberChange}
            placeholder={selectedCountry.format || placeholder}
            required={required}
            className="w-full px-3.5 py-3 bg-transparent text-[15px] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
          />
        </div>

        {/* Country Dropdown Modal/List */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 max-h-72 bg-white dark:bg-[#1A1A22] border border-neutral-200 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Search Filter Header */}
            <div className="p-2 border-b border-neutral-100 dark:border-white/10 bg-neutral-50/50 dark:bg-white/5">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-neutral-400 absolute left-2.5" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country or code..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#121218] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Country Items */}
            <div className="max-h-56 overflow-y-auto p-1 divide-y divide-neutral-50 dark:divide-white/5">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={`${country.iso}-${country.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-blue-50 dark:hover:bg-white/10 transition text-left ${
                      selectedCountry.iso === country.iso
                        ? "bg-blue-50/80 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-neutral-700 dark:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base leading-none">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">({country.iso})</span>
                    </div>
                    <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0 ml-2">
                      {country.dialCode}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-neutral-400">
                  No matching countries found
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      <div className="text-[11px] text-neutral-400 pl-1 flex items-center justify-between">
        <span>Numbers starting with 0 are formatted automatically.</span>
        <span className="font-mono">{selectedCountry.iso}</span>
      </div>
    </div>
  );
}
