type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

interface LogMeta {
  [key: string]: unknown;
}

function formatMessage(level: LogLevel, message: string, meta: LogMeta | null = null): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level}] [riwayat-notification-sender] ${message}`;

  if (meta) {
    return `${base} | ${JSON.stringify(meta)}`;
  }
  return base;
}

export const logger = {
  error(message: string, meta: LogMeta | null = null): void {
    console.error(formatMessage("ERROR", message, meta));
  },

  warn(message: string, meta: LogMeta | null = null): void {
    console.warn(formatMessage("WARN", message, meta));
  },

  info(message: string, meta: LogMeta | null = null): void {
    console.log(formatMessage("INFO", message, meta));
  },

  debug(message: string, meta: LogMeta | null = null): void {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG === "true") {
      console.log(formatMessage("DEBUG", message, meta));
    }
  },
};
