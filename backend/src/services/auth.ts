import { google } from 'googleapis';
import { credentials } from '../lib/credentials';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar',
];

export const getAuthUrl = async cb => {
  try {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    );
    const authUrl = await oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    return cb(null, authUrl);
  } catch (error) {
    return cb(error);
  }
};
export const getAuthToken = async (code, cb) => {
  try {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    );
    oAuth2Client.getToken(code, (error, token) => {
      if (error) cb(error);
      cb(null, token);
    });
  } catch (error) {
    return cb(error);
  }
};
