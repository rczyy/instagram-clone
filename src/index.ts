import express from "express";

const app = express();
const port = process.env.PORT || 5000;

const start = () => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get("/api/healthcheck", (_, res) => res.sendStatus(200));

  app.listen(port, () => console.log(`Started listening to port ${port}`));
};

start();
