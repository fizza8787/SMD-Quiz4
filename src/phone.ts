export const CODE_LENGTH = 6;

export type Country = {
  iso: string;
  name: string;
  dial: string;
};

const COUNTRY_LIST: Country[] = [
  { iso: "PK", name: "Pakistan", dial: "92" },
  { iso: "US", name: "United States", dial: "1" },
  { iso: "GB", name: "United Kingdom", dial: "44" },
  { iso: "IN", name: "India", dial: "91" },
  { iso: "AE", name: "United Arab Emirates", dial: "971" },
  { iso: "SA", name: "Saudi Arabia", dial: "966" },
  { iso: "CA", name: "Canada", dial: "1" },
  { iso: "AU", name: "Australia", dial: "61" },
  { iso: "DE", name: "Germany", dial: "49" },
  { iso: "BD", name: "Bangladesh", dial: "880" },
  { iso: "TR", name: "Turkey", dial: "90" },
  { iso: "CN", name: "China", dial: "86" },
  { iso: "FR", name: "France", dial: "33" },
  { iso: "MY", name: "Malaysia", dial: "60" },
  { iso: "QA", name: "Qatar", dial: "974" },
  { iso: "OM", name: "Oman", dial: "968" },
  { iso: "KW", name: "Kuwait", dial: "965" },
  { iso: "EG", name: "Egypt", dial: "20" },
  { iso: "ZA", name: "South Africa", dial: "27" },
  { iso: "NG", name: "Nigeria", dial: "234" },
  { iso: "IT", name: "Italy", dial: "39" },
  { iso: "ES", name: "Spain", dial: "34" },
  { iso: "NL", name: "Netherlands", dial: "31" },
  { iso: "SG", name: "Singapore", dial: "65" },
  { iso: "PH", name: "Philippines", dial: "63" },
];

export const COUNTRIES: Country[] = [
  COUNTRY_LIST[0],
  ...COUNTRY_LIST.slice(1).sort((a, b) => a.name.localeCompare(b.name)),
];

/**
 * Build an E.164 number from the selected country and what the user typed.
 * A single leading 0 is treated as a trunk prefix. A pasted +<dial> value is accepted.
 */
export function toE164(dial: string, raw: string): string | null {
  const cc = dial.replace(/\D/g, "");
  if (!cc) return null;

  const compact = raw.trim().replace(/[^\d+]/g, "");
  if (!compact) return null;

  let national: string;
  if (compact.startsWith("+")) {
    if (!compact.startsWith(`+${cc}`)) return null;
    national = compact.slice(cc.length + 1).replace(/\D/g, "");
  } else if (compact.startsWith(`00${cc}`)) {
    national = compact.slice(cc.length + 2);
  } else {
    let digits = compact.replace(/\D/g, "");
    // Drop a pasted country code only when the whole string is longer than a
    // normal 10-digit national number, so "91…" in India is left intact.
    if (digits.length > 10 && digits.startsWith(cc) && /^\d{7,12}$/.test(digits.slice(cc.length))) {
      digits = digits.slice(cc.length);
    }
    national = digits.replace(/^0+/, "");
  }

  if (!/^\d{7,12}$/.test(national)) return null;

  const e164 = `+${cc}${national}`;
  if (!/^\+[1-9]\d{7,14}$/.test(e164)) return null;
  return e164;
}

export function formatE164(e164: string, dial: string): string {
  const cc = dial.replace(/\D/g, "");
  const national = e164.startsWith(`+${cc}`) ? e164.slice(cc.length + 1) : e164.replace(/^\+/, "");
  const grouped =
    national.length === 10
      ? national.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")
      : national.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  return `+${cc} ${grouped}`;
}

export function emptyCode(): string[] {
  return Array.from({ length: CODE_LENGTH }, () => "");
}
