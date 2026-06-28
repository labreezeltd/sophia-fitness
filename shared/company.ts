/* ============================================================
   Operating company for the Savora platform.
   Edit these details in one place; the whole app reads from here.
   ============================================================ */

export const COMPANY = {
  product: "Savora",
  legalName: "Axiom Technologies Group Ltd",
  director: "Mirza Fida Baig",
  email: "info@axiom-tech.co.uk",
  phone: "07581 346666",
  address: {
    line1: "Unit 4A, Albion Business Centre",
    line2: "Priestley Road, Wardley Industrial Estate",
    city: "Worsley",
    postcode: "M28 2LY",
    country: "United Kingdom",
  },
} as const;

export const COMPANY_ADDRESS_ONE_LINE =
  `${COMPANY.address.line1}, ${COMPANY.address.line2}, ${COMPANY.address.city}, ${COMPANY.address.postcode}`;
