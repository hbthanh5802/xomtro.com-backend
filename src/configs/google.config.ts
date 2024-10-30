import { env } from '@/configs/env.config';
import { OAuth2Client } from 'google-auth-library';

const clientId = env.GOOGLE_CLIENT_ID;
const clientSecret = env.GOOGLE_CLIENT_SECRET;

const googleClient = new OAuth2Client(clientId, clientSecret, 'postmessage');

export default googleClient;
