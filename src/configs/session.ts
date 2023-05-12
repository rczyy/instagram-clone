import session from "express-session";
import mySqlSession from "express-mysql-session";

export const startSession = () => {
  const MySqlStore = mySqlSession(session as any);
  const sessionStore = new MySqlStore({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  if (!process.env.SESSION_SECRET) {
    throw new Error("No session secret provided.");
  }

  return session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    name: "sid",
    store: sessionStore,
  });
};
