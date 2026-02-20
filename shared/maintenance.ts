export const MAINTENANCE_MODE = true;

export const MAINTENANCE_ESTIMATED_RETURN_DAYS = 5;

export const MAINTENANCE_TITLE = "Platform Under Maintenance";

export const MAINTENANCE_MESSAGE =
  "We are currently under maintenance to improve system performance and security. We will be back soon.";

export const MAINTENANCE_BALANCE_MESSAGE =
  "Everything will remain as it is: no balance will be reset due to inactivity during maintenance.";

export const INACTIVITY_BALANCE_RESET_ENABLED = false;

export const MAINTENANCE_BLOCKED_API_PREFIXES = [
  "/api",
  "/auth",
  "/videos",
  "/daily-votes",
  "/balance",
  "/transactions",
  "/withdrawals",
  "/plus",
  "/demo",
  "/ping",
] as const;

export function isMaintenanceBlockedPath(path: string): boolean {
  return MAINTENANCE_BLOCKED_API_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function getMaintenancePayload() {
  return {
    maintenance: true as const,
    title: MAINTENANCE_TITLE,
    message: MAINTENANCE_MESSAGE,
    estimatedReturnDays: MAINTENANCE_ESTIMATED_RETURN_DAYS,
    inactivityBalanceResetEnabled: INACTIVITY_BALANCE_RESET_ENABLED,
    balancePolicy: MAINTENANCE_BALANCE_MESSAGE,
  };
}
