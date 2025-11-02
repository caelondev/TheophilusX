declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string,
      GUILD_ID: string,
      MONGODB_URI: string,
      ENVIRONMENT: "dev" | "prod" | "debug"
    }
  }
}

export {}
