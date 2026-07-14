# Footer & Contact Page Update Plan

## Files to Modify

1. `frontend/components/layout/PublicFooter.tsx`
2. `frontend/app/(public)/contact/page.tsx`

---

## Task 1 — Reorder Footer Columns (`PublicFooter.tsx`)

**Current order (left → right):** Brand → Departments → Contact → Partners  
**Target order:** Brand → Contact → Departments → Partners

**Implementation:**
- Move the entire `<div>` block for Contact (currently lines 80–93) so it appears immediately after the Brand block (after line 65), before the Departments block.
- Move the Departments block after the Contact block (it currently starts at line 67).
- Partners stays last.
- The 4-column `lg:grid-cols-4` grid layout handles the visual placement automatically based on DOM order, so no CSS changes needed.

**Resolve data inconsistency:**
- Footer values: email `info@siayacommunitydigitalhub.or.ke`, phone `+254 754 951 128`, location `Bondo Town, Siaya County, Kenya`
- Contact page currently has different values. Update the contact page to match the footer values (see Task 2).

---

## Task 2 — Update Contact Page Values (`contact/page.tsx`)

**Update the `contacts` array** to match the footer data:

```tsx
const contacts = [
  { title: 'Email', detail: 'info@siayacommunitydigitalhub.or.ke', icon: Mail },
  { title: 'Phone', detail: '+254 754 951 128', icon: Phone },
  { title: 'Location', detail: 'Bondo Town, Siaya County, Kenya', icon: MapPin },
];
```

**Message textarea already exists** at lines 79–86 — no change needed. The form already has Full Name, Email Address, Subject, and Message fields with their respective icons in the contact cards above.

---

## Validation Steps

1. Run `pnpm dev` and navigate to `/contact` — confirm 3 contact cards show correct email, phone, location with icons.
2. Navigate to any public page and check the footer — confirm column order is Brand → Contact → Departments → Partners.
3. Verify the contact info values are identical in both the footer and the contact page.
