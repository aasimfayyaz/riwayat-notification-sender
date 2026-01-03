import amqp, { Connection, Channel } from "amqplib";
import { logger } from "./logger";
import { NotificationMessage } from "./types";

let connection: Connection | null = null;
let channel: Channel | null = null;

export async function getConnection(): Promise<{ connection: Connection; channel: Channel }> {
  if (connection && channel) {
    return { connection, channel };
  }

  const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

  try {
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();

    const exchange = process.env.NOTIFICATION_EXCHANGE || "notifications";
    const queue = process.env.NOTIFICATION_QUEUE || "notification.event";
    const exchangeType = process.env.NOTIFICATION_EXCHANGE_TYPE || "direct";

    await channel.assertExchange(exchange, exchangeType, { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, "");

    connection.on("error", (err: Error) => {
      logger.error("RabbitMQ connection error", { error: err.message });
      connection = null;
      channel = null;
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
      connection = null;
      channel = null;
    });

    logger.info("RabbitMQ connection established");
    return { connection, channel };
  } catch (error) {
    const err = error as Error;
    logger.error("Failed to connect to RabbitMQ", { error: err.message });
    connection = null;
    channel = null;
    throw error;
  }
}

export async function publish(message: NotificationMessage): Promise<boolean> {
  const exchange = process.env.NOTIFICATION_EXCHANGE || "notifications";
  const routingKey = "";

  try {
    const { channel } = await getConnection();

    const messageBuffer = Buffer.from(JSON.stringify(message));

    const published = channel.publish(exchange, routingKey, messageBuffer, {
      persistent: true,
      contentType: "application/json",
      timestamp: Date.now(),
    });

    if (published) {
      logger.debug("Message published successfully", { event_code: message.event_code });
    } else {
      logger.warn("Message was not confirmed by RabbitMQ", { event_code: message.event_code });
    }

    return published;
  } catch (error) {
    const err = error as Error;
    logger.error("Failed to publish message", {
      event_code: message.event_code,
      error: err.message,
    });
    throw error;
  }
}

export async function close(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    logger.info("RabbitMQ connection closed gracefully");
  } catch (error) {
    const err = error as Error;
    logger.error("Error closing RabbitMQ connection", { error: err.message });
  }
}
