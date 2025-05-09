import crypto from 'crypto'
import dotenv from 'dotenv'
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

export function hashTokens(token){
    return crypto
        .createHmac('sha256', process.env.SESSION_SECRET)
        .update(token)
        .digest('hex')
}
