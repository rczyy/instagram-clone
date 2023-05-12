import express from "express";
import { startSession } from "./configs/session";
import { userRoute } from "./routes/user.route";

const app = express();
const port = process.env.PORT || 5000;

const start = () => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(startSession());

  app.get("/api/healthcheck", (_, res) => res.sendStatus(200));
  app.use("/api/user", userRoute);

  app.listen(port, () => console.log(`Started listening to port ${port}.`));
};

start();
