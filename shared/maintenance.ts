export const MAINTENANCE_MODE = true;

export const MAINTENANCE_ESTIMATED_RETURN_DAYS = 5;

export const MAINTENANCE_TITLE = "Plataforma em manutencao";

export const MAINTENANCE_MESSAGE =
  "Estamos em manutencao para melhorias no sistema e na seguranca. Voltaremos em breve.";

export const MAINTENANCE_BALANCE_MESSAGE =
  "Tudo continua como esta: nenhum saldo sera zerado por regra de inatividade durante a manutencao.";

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
