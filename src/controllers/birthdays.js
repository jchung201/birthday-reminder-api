const router = require("express").Router();
import asyncHandler from "express-async-handler";
const { listEvents } = require("../services/listEvents");
const { createEvent } = require("../services/createEvent");
const { deleteEvent } = require("../services/deleteEvent");
import { credentials } from "../lib/credentials.js";
const { patchEvent } = require("../services/patchEvent");
const { calendarCheck } = require("../services/calendarCheck");
const { google } = require("googleapis");

router.use(
  "/",
  asyncHandler(async (req, res, next) => {
    const { token } = req.body;
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    oAuth2Client.setCredentials(JSON.parse(JSON.stringify(token)));
    req.auth = oAuth2Client;
    next();
  })
);

router
  .get(
    "/",
    asyncHandler(async (req, res, next) => {
      calendarCheck(req.auth, (err, calendar) => {
        if (err) return next(err);
        listEvents(req.auth, calendar.id, (err, events) => {
          if (err) return next(err);
          res.send(events);
        });
      });
    })
  )
  .post(
    "/",
    asyncHandler(async (req, res, next) => {
      let { events } = req.body;
      events = [
        {
          date: "11/30/2019",
          name: "John Daniel",
          description: "description is awesome",
          days: 5
        }
      ];
      calendarCheck(req.auth, (err, calendar) => {
        if (err) return next(err);
        createEvent(req.auth, calendar.id, events, (err, createdEvents) => {
          if (err) return next(err);
          res.send(createdEvents);
        });
      });
    })
  )
  .patch(
    "/",
    asyncHandler(async (req, res, next) => {
      let { event } = req.body;
      event = {
        date: "11/30/2019",
        name: "Jefferson Daniel",
        description: "This has been patched",
        days: 11,
        eventId: "3ek5inrb21e0j3urq2r5s7umhs"
      };
      calendarCheck(req.auth, (err, calendar) => {
        if (err) return next(err);
        patchEvent(req.auth, calendar.id, event, (err, patchedEvent) => {
          if (err) return next(err);
          res.send(patchedEvent);
        });
      });
    })
  )
  .delete(
    "/:id",
    asyncHandler(async (req, res, next) => {
      await calendarCheck(req.auth, (err, calendar) => {
        if (err) return next(err);
        deleteEvent(req.auth, calendar.id, req.params.id, (err, message) => {
          if (err) return next(err);
          res.send({ status: 204, message: "Deleted!" });
        });
      });
    })
  );

module.exports = router;
