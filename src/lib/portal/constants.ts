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

export const STAFF_ROLES = ["coach", "admin"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
