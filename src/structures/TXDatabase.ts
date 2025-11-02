import mongoose, { Schema, Types } from "mongoose";
import { PrettyLogger as log, LogTag } from "../utils/PrettyLogger";

export default class TXDatabase {
  private static _connection: typeof mongoose | null = null;
  private static _instance: TXDatabase | null = null;

  public static Schema = Schema;
  public static model = mongoose.model.bind(mongoose);
  public static Types = Types;

  constructor() {
    if (TXDatabase._instance) {
      return TXDatabase._instance;
    }
    TXDatabase._instance = this;
  }

  public async initialize(): Promise<void> {
    log.info({
      message: "TXDatabase initialization started",
      tag: LogTag.DATABASE,
    });

    await TXDatabase.connect(process.env.MONGODB_URI!);

    log.success({
      message: "TXDatabase ready",
      tag: LogTag.DATABASE,
    });
  }

  private static async connect(uri: string): Promise<void> {
    try {
      log.info({
        message: "Establishing database connection...",
        tag: LogTag.DATABASE,
      });

      this._connection = await mongoose.connect(uri);

      mongoose.connection.on("error", (error) => {
        log.error({
          message: "Database connection error",
          tag: LogTag.DATABASE,
          extra: [error],
        });
      });

      mongoose.connection.on("disconnected", () => {
        log.warn({
          message: "Database disconnected",
          tag: LogTag.DATABASE,
        });
      });

      mongoose.connection.on("reconnected", () => {
        log.success({
          message: "Database reconnected",
          tag: LogTag.DATABASE,
        });
      });

      log.success({
        message: "Database connection established",
        tag: LogTag.DATABASE,
      });
    } catch (error) {
      log.error({
        message: "Failed to connect to database",
        tag: LogTag.DATABASE,
        extra: [error],
      });
      process.exit(1);
    }
  }

  public static async disconnect(): Promise<void> {
    if (this._connection) {
      try {
        await mongoose.disconnect();
        log.success({
          message: "Database connection closed gracefully",
          tag: LogTag.DATABASE,
        });
      } catch (error) {
        log.error({
          message: "Error while disconnecting from database",
          tag: LogTag.DATABASE,
          extra: [error],
        });
      }
    } else {
      log.warn({
        message: "No active database connection to close",
        tag: LogTag.DATABASE,
      });
    }
  }

  public static isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  public static getConnectionState(): string {
    const states: { [key: number]: string } = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    return states[mongoose.connection.readyState] || "unknown";
  }

  public static get connection() {
    return mongoose.connection;
  }
}
