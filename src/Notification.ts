import { config } from "dotenv";
import { publish, close } from "./queue";
import { logger } from "./logger";
import { NotificationPayload, NotificationMessage, SendResult, NotificationSender } from "./types";
import { NotificationValidationError } from "./errors";

config();

function validateEventCode(eventCode: string): void {
  if (!eventCode || typeof eventCode !== "string" || eventCode.trim() === "") {
    throw new NotificationValidationError("eventCode must be a non-empty string");
  }
}

function validatePayload(payload: unknown): asserts payload is NotificationPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new NotificationValidationError("payload must be a non-null object");
  }
}

export function createNotificationSender(): NotificationSender {
  async function send(eventCode: string, payload: NotificationPayload): Promise<SendResult> {
    try {
      validateEventCode(eventCode);
      validatePayload(payload);
    } catch (error) {
      const err = error as Error;
      logger.error("Validation failed", { error: err.message });
      throw error;
    }

    const message: NotificationMessage = {
      event_code: eventCode.trim(),
      payload: payload,
      timestamp: new Date().toISOString(),
    };

    try {
      await publish(message);
      logger.info("Notification sent successfully", { event_code: eventCode });
      return { success: true, message: "Notification sent" };
    } catch (error) {
      const err = error as Error;
      logger.error("Failed to send notification", {
        event_code: eventCode,
        error: err.message,
      });
      return { success: false, message: err.message };
    }
  }

  return {
    send,
    close,
  };
}

export const Notification = createNotificationSender();
