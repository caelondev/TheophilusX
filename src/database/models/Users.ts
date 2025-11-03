import { Schema, model } from "mongoose";

const usersSchema = new Schema({
  guildId: {
    type: Number,
    required: true,
  },
  userId: {
    type: Number,
    required: true
  },
  lastDaily: {
    type: Date,
    default: null,
  },
  balance: {
    type: Number,
    default: 0
  }
})

export default model("Users", usersSchema)
