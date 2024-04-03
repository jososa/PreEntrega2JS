import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default __dirname

import mongoose from "mongoose"

export function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id)
}