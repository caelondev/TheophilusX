/**
 * TheophilusX
 * Copyright (C) 2025 caelondev
 * Licensed under the GNU Affero General Public License v3.0
 * See LICENSE file for details.
 */

import { CommandType } from "../typings/Command";

export default class TXSlashCommand {

  constructor(commandOptions: CommandType){
    Object.assign(this, commandOptions)
  }
}
