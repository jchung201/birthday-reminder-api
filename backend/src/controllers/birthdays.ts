import * as express from 'express';
const router = express.Router();
import expressAsyncHandler from 'express-async-handler';
import httpErrors from 'http-errors';
import { listEvents } from '../services/listEvents';
import { createEvent } from '../services/createEvent';
import { deleteEvent } from '../services/deleteEvent';
import { credentials } from '../lib/credentials';
import { patchEvent } from '../services/patchEvent';
import { calendarCheck } from '../services/calendarCheck';
import { google } from 'googleapis';

interface IUserRequest extends express.Request {
  auth: any;
  calendar: any;
  timeZone: any;
}

router.use(
  '/',
  expressAsyncHandler(async (req: IUserRequest, _res, next) => {
    const token = JSON.parse(req.headers.authorization);
    // Include entire response from the POST get token response
    if (!token) throw httpErrors(400, 'Forgot token!');
    try {
      const { client_secret, client_id, redirect_uris } = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0],
      );
      oAuth2Client.setCredentials(token);
      req.auth = oAuth2Client;
      calendarCheck(req.auth, (err, calendar, timeZone) => {
        if (err) return next(err);
        req.calendar = calendar;
        req.timeZone = timeZone;
        next();
      });
    } catch (error) {
      next(error);
    }
  }),
);

router
  .get(
    '/',
    expressAsyncHandler(async (req: IUserRequest, res, next) => {
      listEvents(req.auth, req.calendar.id, (err, events) => {
        if (err) return next(err);
        res.send(events);
      });
    }),
  )
  .post(
    '/',
    expressAsyncHandler(async (req: IUserRequest, res, next) => {
      const { birthday } = req.body;
      if (!birthday) throw httpErrors(400, 'Forgot to include birthday!');
      createEvent(
        req.auth,
        req.calendar.id,
        req.timeZone,
        birthday,
        (err, createdEvents) => {
          if (err) return next(err);
          res.send(createdEvents);
        },
      );
    }),
  )
  .patch(
    '/:id',
    expressAsyncHandler(async (req: IUserRequest, res, next) => {
      const { event } = req.body;
      if (!event) throw httpErrors(400, 'Forgot event update details!');
      patchEvent(
        req.auth,
        req.calendar.id,
        req.timeZone,
        req.params.id,
        event,
        (err, patchedEvent) => {
          if (err) return next(err);
          res.send(patchedEvent);
        },
      );
    }),
  )
  .delete(
    '/:id',
    expressAsyncHandler(async (req: IUserRequest, res, next) => {
      deleteEvent(req.auth, req.calendar.id, req.params.id, err => {
        if (err) return next(err);
        res.send({ status: 204, message: 'Deleted!' });
      });
    }),
  );

export default router;
