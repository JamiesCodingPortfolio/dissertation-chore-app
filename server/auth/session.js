import { z } from 'zod';
import crypto from 'crypto';

const sessionSchema = z.object({
    id: z.string()
})

export function createUserSession(user, cookies){
    const sessionId = crypto.randomBytes(512).toString("hex").normalize();
}