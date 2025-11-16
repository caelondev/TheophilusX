/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import express from "express"
import { PrettyLogger as log, LogTag } from "./utils/PrettyLogger"

const app = express()
const PORT = process.env.PORT || 8080

app.set("trust proxy", true)

app.get("/", (req, res)=>{
  res.send("Bot is online")
})

export default ()=>{
  app.listen(PORT, ()=>{
    log.success({
      message: `Web is running on PORT: ${PORT}`,
      tag: LogTag.WEB
    })
  })
}
