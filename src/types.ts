export interface NotificationPayload {
  [key: string]: unknown;
}

export interface NotificationMessage {
  event_code: string;
  payload: NotificationPayload;
  timestamp: string;
}

export interface NotificationConfig {
  rabbitmqUrl?: string;
  queue?: string;
  exchange?: string;
  exchangeType?: "direct" | "fanout" | "topic";
}

export interface SendResult {
  success: boolean;
  message: string;
}

export interface NotificationSender {
  send(eventCode: string, payload: NotificationPayload): Promise<SendResult>;
  close(): Promise<void>;
}
