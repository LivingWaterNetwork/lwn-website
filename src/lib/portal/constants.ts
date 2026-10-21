/**
 * Modules a program template/enrollment can switch on. `core` (journey,
 * sessions, steps, documents) is always on and isn't listed here. A module
 * from a later phase stays hidden even if a template or enrollment sets it
 * true — gate every module-aware UI/API check through this one constant so
 * Phase 2/3 modules can be added to a template's JSON ahead of the code that
 * reads them without anything leaking early.
 */
export const MODULES_AVAILABLE = ["payments", "reflections", "stewardship", "business_launch"] as const;

export type PortalModule = (typeof MODULES_AVAILABLE)[number];

export function isModuleAvailable(key: string): key is PortalModule {
  return (MODULES_AVAILABLE as readonly string[]).includes(key);
}

/**
 * What a *partner* grant may ever expose — a completely separate, much
 * narrower list from MODULES_AVAILABLE above. Partners never see payments,
 * reflections, stewardship, business_launch, recaps, or private notes,
 * regardless of what an enrollment's own modules allow a member/coach to
 * see. Phase 1 allows only brand_website; this is its own type so a
 * partner-grant module can never accidentally be validated against — or
 * confused with — the member/coach module list above.
 */
export const PARTNER_GRANTABLE_MODULES = ["brand_website"] as const;

export type PartnerGrantableModule = (typeof PARTNER_GRANTABLE_MODULES)[number];

export function isPartnerGrantableModule(key: string): key is PartnerGrantableModule {
  return (PARTNER_GRANTABLE_MODULES as readonly string[]).includes(key);
}

export const STAFF_ROLES = ["coach", "admin"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
