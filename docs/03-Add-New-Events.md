# Adding New Events

This guide explains how to create event handlers for your TheophilusX bot.

## Event Structure

Events in TheophilusX are stored in the `src/events/` directory. Each event file exports an instance of `TXEvent`.

```
src/events/
├── 01-deleteDuplicatedCommands.ts
├── 02-syncCommands.ts
├── 03-clientReady.ts
├── handleCommands.ts
└── ...
```

## Creating a Basic Event

### Step 1: Create the Event File

Create a new file in the `src/events/` directory:

```
src/events/welcomeMessage.ts
```

### Step 2: Define the Event

```typescript
import { TXEvent } from "../structures/TXEvent";

export default new TXEvent("guildMemberAdd", (member) => {
  // Send a welcome message when a user joins
  const channel = member.guild.systemChannel;

  if (channel) {
    channel.send(`Welcome to the server, ${member.user.tag}!`);
  }
});
```

### Step 3: Restart Your Bot

After creating the event file:

1. Rebuild the project: `npm run build`
2. Restart your bot: `npm run start`

The bot will automatically detect and register the new event handler.

## The TXEvent Class

The `TXEvent` class is a generic wrapper for Discord.js events. It accepts two parameters:

```typescript
new TXEvent(
  "eventName", // The Discord.js event name
  (args) => {}, // The event handler function
);
```

### Constructor Parameters

1. **`event`** (Key extends keyof ClientEvents): The Discord.js event name
2. **`execute`** (function): The function that runs when the event fires

The execute function receives the same arguments as the Discord.js event would normally provide.

## Common Events

Here are some commonly used Discord.js events:

### clientReady

Fires when the bot is ready and logged in.

```typescript
import { client } from "../main";
import { TXEvent } from "../structures/TXEvent";
import { PrettyLogger as log, LogTag } from "../utils/PrettyLogger";

export default new TXEvent("clientReady", () => {
  log.success({
    message: `${client.user?.username} is now ready`,
    tag: LogTag.READY,
  });
});
```

### messageCreate

Fires when a message is sent in a channel the bot can see.

```typescript
import { TXEvent } from "../structures/TXEvent";

export default new TXEvent("messageCreate", (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Respond to messages containing "hello"
  if (message.content.toLowerCase().includes("hello")) {
    message.reply("Hello there!");
  }
});
```

### guildMemberAdd

Fires when a user joins a server.

```typescript
import { TXEvent } from "../structures/TXEvent";

export default new TXEvent("guildMemberAdd", (member) => {
  console.log(`${member.user.tag} joined ${member.guild.name}`);

  // Assign a default role
  const role = member.guild.roles.cache.find((r) => r.name === "Member");
  if (role) {
    member.roles.add(role);
  }
});
```

### guildMemberRemove

Fires when a user leaves a server.

```typescript
import { TXEvent } from "../structures/TXEvent";

export default new TXEvent("guildMemberRemove", (member) => {
  console.log(`${member.user.tag} left ${member.guild.name}`);
});
```

### interactionCreate

Fires when any interaction is created (handled automatically by TheophilusX for commands).

```typescript
import { TXEvent } from "../structures/TXEvent";

export default new TXEvent("interactionCreate", (interaction) => {
  if (interaction.isButton()) {
    console.log(`Button clicked: ${interaction.customId}`);
  }
});
```

## Accessing the Client

If you need to reference the client instance in your event handler, import it from `../main`:

```typescript
import { client } from "../main";
import { TXEvent } from "../structures/TXEvent";

export default new TXEvent("messageCreate", (message) => {
  // Access client properties
  console.log(`Bot username: ${client.user?.username}`);
  console.log(`Total guilds: ${client.guilds.cache.size}`);

  // Your event logic here
});
```

## Event Precedence

TheophilusX supports event priority through number-based prefixes. Events are executed in order based on their filename:

```
01-event-first.ts      # Executes first
02-event-second.ts     # Executes second
03-event-third.ts      # Executes third
normalEvent.ts         # Executes after all numbered events
anotherEvent.ts        # Executes after all numbered events
```

### How It Works

- **Number-prefixed events**: Executed in numerical order (01, 02, 03, ...)
- **Non-prefixed events**: Executed after all numbered events, in alphabetical order
- The smaller the number prefix, the higher the priority

### When to Use Priority

Use numbered prefixes when event execution order matters:

```
01-deleteDuplicatedCommands.ts  # Must run first
02-syncCommands.ts              # Must run after duplicates are deleted
03-clientReady.ts               # Run after commands are synced
handleCommands.ts               # Order doesn't matter
```

### Example Priority Usage

```typescript
// 01-initializeDatabase.ts
import { TXEvent } from "../structures/TXEvent";

export default new TXEvent("clientReady", async () => {
  // This runs FIRST - initialize database connection
  await database.connect();
  console.log("Database connected");
});
```

```typescript
// 02-loadGuildConfigs.ts
import { TXEvent } from "../structures/TXEvent";

export default new TXEvent("clientReady", async () => {
  // This runs SECOND - load configs after database is ready
  await loadAllGuildConfigs();
  console.log("Guild configs loaded");
});
```

```typescript
// 03-startServices.ts
import { TXEvent } from "../structures/TXEvent";

export default new TXEvent("clientReady", () => {
  // This runs THIRD - start services after everything is ready
  startBackgroundTasks();
  console.log("Services started");
});
```

## Advanced Examples

### Error Handling

```typescript
import { TXEvent } from "../structures/TXEvent";
import { PrettyLogger as log, LogTag } from "../utils/PrettyLogger";

export default new TXEvent("error", (error) => {
  log.error({
    message: "An error occurred",
    tag: LogTag.CORE,
    extra: [error],
  });
});
```

### Voice State Updates

```typescript
import { TXEvent } from "../structures/TXEvent";

export default new TXEvent("voiceStateUpdate", (oldState, newState) => {
  // User joined a voice channel
  if (!oldState.channel && newState.channel) {
    console.log(`${newState.member?.user.tag} joined ${newState.channel.name}`);
  }

  // User left a voice channel
  if (oldState.channel && !newState.channel) {
    console.log(`${oldState.member?.user.tag} left ${oldState.channel.name}`);
  }
});
```

### Message Reactions

```typescript
import { TXEvent } from "../structures/TXEvent";

export default new TXEvent("messageReactionAdd", (reaction, user) => {
  // Ignore bot reactions
  if (user.bot) return;

  console.log(`${user.tag} reacted with ${reaction.emoji.name}`);
});
```

### Guild Events

```typescript
import { TXEvent } from "../structures/TXEvent";
import { client } from "../main";

export default new TXEvent("guildCreate", (guild) => {
  console.log(`Bot joined new guild: ${guild.name}`);
  console.log(`Now in ${client.guilds.cache.size} guilds`);
});
```

## Best Practices

1. **Keep events focused**: Each event file should handle one specific task
2. **Use priority prefixes wisely**: Only use numbered prefixes when execution order matters
3. **Handle errors gracefully**: Wrap async operations in try-catch blocks
4. **Avoid blocking operations**: Use async/await for long-running tasks
5. **Log important events**: Use PrettyLogger to track event execution
6. **Check for null values**: Always validate that objects exist before accessing properties
7. **Import client when needed**: Import from `../main` to access the client instance

## Available Discord.js Events

Here are some commonly used events (see [Discord.js documentation](https://discord.js.org/#/docs/discord.js/main/class/Client) for a complete list):

- `clientReady` - Bot is ready
- `messageCreate` - New message sent
- `messageUpdate` - Message edited
- `messageDelete` - Message deleted
- `guildMemberAdd` - User joined server
- `guildMemberRemove` - User left server
- `guildMemberUpdate` - Member updated (roles, nickname, etc.)
- `guildCreate` - Bot joined a server
- `guildDelete` - Bot removed from server
- `interactionCreate` - Interaction created (commands, buttons, etc.)
- `voiceStateUpdate` - Voice state changed
- `messageReactionAdd` - Reaction added to message
- `messageReactionRemove` - Reaction removed from message
- `channelCreate` - Channel created
- `channelDelete` - Channel deleted
- `roleCreate` - Role created
- `roleDelete` - Role deleted
- `error` - Error occurred

## Troubleshooting

**Event not firing:**

- Ensure the event name matches Discord.js event names exactly
- Check that required intents are enabled for the event
- Verify the file exports `default new TXEvent(...)`
- Rebuild with `npm run build` and restart the bot

**Events executing in wrong order:**

- Use number prefixes (01-, 02-, etc.) to control execution order
- Ensure numbers are zero-padded (01 not 1) for proper sorting

**Cannot access client:**

- Import client from `../main`: `import { client } from "../main"`
- Make sure you're accessing client properties that exist

**TypeScript errors:**

- Ensure event parameter types match the Discord.js event signature
- Check the [Discord.js documentation](https://discord.js.org) for correct event types

---

**Congratulations!** You now know how to create commands and events in TheophilusX. Happy coding!
