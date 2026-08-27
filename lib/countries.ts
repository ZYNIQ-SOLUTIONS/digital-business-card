export interface Country {
  name: string;
  iso: string;
  dialCode: string;
  flag: string;
  format?: string;
}

export const COUNTRIES: Country[] = [
  { name: "United States", iso: "US", dialCode: "+1", flag: "🇺🇸", format: "(555) 000-0000" },
  { name: "United Kingdom", iso: "GB", dialCode: "+44", flag: "🇬🇧", format: "7000 000000" },
  { name: "Canada", iso: "CA", dialCode: "+1", flag: "🇨🇦", format: "(555) 000-0000" },
  { name: "United Arab Emirates", iso: "AE", dialCode: "+971", flag: "🇦🇪", format: "50 000 0000" },
  { name: "Saudi Arabia", iso: "SA", dialCode: "+966", flag: "🇸🇦", format: "50 000 0000" },
  { name: "Algeria", iso: "DZ", dialCode: "+213", flag: "🇩🇿", format: "550 00 00 00" },
  { name: "France", iso: "FR", dialCode: "+33", flag: "🇫🇷", format: "6 00 00 00 00" },
  { name: "Germany", iso: "DE", dialCode: "+49", flag: "🇩🇪", format: "150 0000000" },
  { name: "Australia", iso: "AU", dialCode: "+61", flag: "🇦🇺", format: "400 000 000" },
  { name: "India", iso: "IN", dialCode: "+91", flag: "🇮🇳", format: "90000 00000" },
  { name: "Qatar", iso: "QA", dialCode: "+974", flag: "🇶🇦", format: "3000 0000" },
  { name: "Kuwait", iso: "KW", dialCode: "+965", flag: "🇰🇼", format: "5000 0000" },
  { name: "Bahrain", iso: "BH", dialCode: "+973", flag: "🇧🇭", format: "3000 0000" },
  { name: "Oman", iso: "OM", dialCode: "+968", flag: "🇴🇲", format: "9000 0000" },
  { name: "Egypt", iso: "EG", dialCode: "+20", flag: "🇪🇬", format: "10 0000 0000" },
  { name: "Morocco", iso: "MA", dialCode: "+212", flag: "🇲🇦", format: "600-000000" },
  { name: "Tunisia", iso: "TN", dialCode: "+216", flag: "🇹🇳", format: "20 000 000" },
  { name: "Jordan", iso: "JO", dialCode: "+962", flag: "🇯🇴", format: "7 0000 0000" },
  { name: "Lebanon", iso: "LB", dialCode: "+961", flag: "🇱🇧", format: "70 000 000" },
  { name: "Iraq", iso: "IQ", dialCode: "+964", flag: "🇮🇶", format: "700 000 0000" },
  { name: "Turkey", iso: "TR", dialCode: "+90", flag: "🇹🇷", format: "500 000 0000" },
  { name: "Spain", iso: "ES", dialCode: "+34", flag: "🇪🇸", format: "600 000 000" },
  { name: "Italy", iso: "IT", dialCode: "+39", flag: "🇮🇹", format: "300 000 0000" },
  { name: "Netherlands", iso: "NL", dialCode: "+31", flag: "🇳🇱", format: "6 00000000" },
  { name: "Switzerland", iso: "CH", dialCode: "+41", flag: "🇨🇭", format: "70 000 00 00" },
  { name: "Belgium", iso: "BE", dialCode: "+32", flag: "🇧🇪", format: "400 00 00 00" },
  { name: "Sweden", iso: "SE", dialCode: "+46", flag: "🇸🇪", format: "70 000 00 00" },
  { name: "Norway", iso: "NO", dialCode: "+47", flag: "🇳🇴", format: "400 00 000" },
  { name: "Denmark", iso: "DK", dialCode: "+45", flag: "🇩🇰", format: "20 00 00 00" },
  { name: "Finland", iso: "FI", dialCode: "+358", flag: "🇫🇮", format: "40 0000000" },
  { name: "Poland", iso: "PL", dialCode: "+48", flag: "🇵🇱", format: "500 000 000" },
  { name: "Portugal", iso: "PT", dialCode: "+351", flag: "🇵🇹", format: "900 000 000" },
  { name: "Austria", iso: "AT", dialCode: "+43", flag: "🇦🇹", format: "650 0000000" },
  { name: "Ireland", iso: "IE", dialCode: "+353", flag: "🇮🇪", format: "85 000 0000" },
  { name: "Singapore", iso: "SG", dialCode: "+65", flag: "🇸🇬", format: "8000 0000" },
  { name: "Malaysia", iso: "MY", dialCode: "+60", flag: "🇲🇾", format: "12-000 0000" },
  { name: "Japan", iso: "JP", dialCode: "+81", flag: "🇯🇵", format: "90-0000-0000" },
  { name: "South Korea", iso: "KR", dialCode: "+82", flag: "🇰🇷", format: "10-0000-0000" },
  { name: "China", iso: "CN", dialCode: "+86", flag: "🇨🇳", format: "130 0000 0000" },
  { name: "Hong Kong", iso: "HK", dialCode: "+852", flag: "🇭🇰", format: "9000 0000" },
  { name: "Indonesia", iso: "ID", dialCode: "+62", flag: "🇮🇩", format: "812-0000-0000" },
  { name: "Philippines", iso: "PH", dialCode: "+63", flag: "🇵🇭", format: "900 000 0000" },
  { name: "Thailand", iso: "TH", dialCode: "+66", flag: "🇹🇭", format: "80 000 0000" },
  { name: "Vietnam", iso: "VN", dialCode: "+84", flag: "🇻🇳", format: "90 000 0000" },
  { name: "Pakistan", iso: "PK", dialCode: "+92", flag: "🇵🇰", format: "300 0000000" },
  { name: "Bangladesh", iso: "BD", dialCode: "+880", flag: "🇧🇩", format: "1700-000000" },
  { name: "South Africa", iso: "ZA", dialCode: "+27", flag: "🇿🇦", format: "70 000 0000" },
  { name: "Nigeria", iso: "NG", dialCode: "+234", flag: "🇳🇬", format: "800 000 0000" },
  { name: "Kenya", iso: "KE", dialCode: "+254", flag: "🇰🇪", format: "700 000000" },
  { name: "Ghana", iso: "GH", dialCode: "+233", flag: "🇬🇭", format: "20 000 0000" },
  { name: "Brazil", iso: "BR", dialCode: "+55", flag: "🇧🇷", format: "(11) 90000-0000" },
  { name: "Mexico", iso: "MX", dialCode: "+52", flag: "🇲🇽", format: "55 0000 0000" },
  { name: "Argentina", iso: "AR", dialCode: "+54", flag: "🇦🇷", format: "9 11 0000-0000" },
  { name: "Colombia", iso: "CO", dialCode: "+57", flag: "🇨🇴", format: "300 0000000" },
  { name: "Chile", iso: "CL", dialCode: "+56", flag: "🇨🇱", format: "9 0000 0000" },
  { name: "New Zealand", iso: "NZ", dialCode: "+64", flag: "🇳🇿", format: "20 000 0000" },
  { name: "Greece", iso: "GR", dialCode: "+30", flag: "🇬🇷", format: "690 000 0000" },
  { name: "Czech Republic", iso: "CZ", dialCode: "+420", flag: "🇨🇿", format: "600 000 000" },
  { name: "Romania", iso: "RO", dialCode: "+40", flag: "🇷🇴", format: "700 000 000" },
  { name: "Hungary", iso: "HU", dialCode: "+36", flag: "🇭🇺", format: "20 000 0000" },
  { name: "Israel", iso: "IL", dialCode: "+972", flag: "🇮🇱", format: "50-000-0000" },
  { name: "Ukraine", iso: "UA", dialCode: "+380", flag: "🇺🇦", format: "50 000 0000" },
  { name: "Cyprus", iso: "CY", dialCode: "+357", flag: "🇨🇾", format: "90 000000" },
  { name: "Luxembourg", iso: "LU", dialCode: "+352", flag: "🇱🇺", format: "600 000 000" },
  { name: "Malta", iso: "MT", dialCode: "+356", flag: "🇲🇹", format: "7000 0000" },
  { name: "Iceland", iso: "IS", dialCode: "+354", flag: "🇮🇸", format: "600 0000" },
  { name: "Estonia", iso: "EE", dialCode: "+372", flag: "🇪🇪", format: "5000 0000" },
  { name: "Latvia", iso: "LV", dialCode: "+371", flag: "🇱🇻", format: "2000 0000" },
  { name: "Lithuania", iso: "LT", dialCode: "+370", flag: "🇱🇹", format: "600 00000" },
  { name: "Croatia", iso: "HR", dialCode: "+385", flag: "🇭🇷", format: "90 000 0000" },
  { name: "Serbia", iso: "RS", dialCode: "+381", flag: "🇷🇸", format: "60 0000000" },
  { name: "Slovakia", iso: "SK", dialCode: "+421", flag: "🇸🇰", format: "900 000 000" },
  { name: "Slovenia", iso: "SI", dialCode: "+386", flag: "🇸🇮", format: "40 000 000" },
  { name: "Bulgaria", iso: "BG", dialCode: "+359", flag: "🇧🇬", format: "80 000 0000" },
];

/**
 * Regex code to strip leading zeros from phone numbers
 * e.g. "0612345678" -> "612345678"
 * e.g. "0550 12 34 56" -> "550 12 34 56"
 */
export function stripLeadingZero(phone: string): string {
  if (!phone) return "";
  // Trim spaces and remove all leading 0s
  return phone.replace(/^0+/, "").trim();
}

/**
 * Parse an existing formatted phone string into country code and local number
 */
export function parsePhoneWithCountry(fullPhone: string): { country: Country; localNumber: string } {
  if (!fullPhone) {
    return { country: COUNTRIES[0], localNumber: "" };
  }

  const cleaned = fullPhone.trim();

  // Try to match a known dial code sorted by longest code first
  const sortedCountries = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sortedCountries) {
    if (cleaned.startsWith(c.dialCode)) {
      const remaining = cleaned.slice(c.dialCode.length).trim();
      return {
        country: c,
        localNumber: stripLeadingZero(remaining),
      };
    }
  }

  // If no prefix matched, check if it starts with 0
  return {
    country: COUNTRIES[0],
    localNumber: stripLeadingZero(cleaned),
  };
}

/**
 * Build E.164 standard phone string
 */
export function formatFullPhoneNumber(dialCode: string, localNumber: string): string {
  const sanitized = stripLeadingZero(localNumber);
  if (!sanitized) return "";
  return `${dialCode} ${sanitized}`.trim();
}
