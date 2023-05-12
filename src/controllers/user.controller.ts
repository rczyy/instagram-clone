import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { compare, hash } from "bcrypt";
import _ from "lodash";

const prisma = new PrismaClient();

export const getUsers: RequestHandler = async (_, res) => {
  const users = await prisma.user.findMany();

  return res.status(200).send(users);
};

export const getMe: RequestHandler = async (req, res) => {
  const { sid } = req.session;

  if (!sid) return res.status(401).send({ message: "Not authenticated." });

  const me = await prisma.user.findFirst({
    where: {
      id: sid,
    },
  });

  return res.status(200).send(_.omit(me, ["password"]));
};

export const signupUser: RequestHandler = async (req, res) => {
  const schema = z.object({
    name: z.string({ required_error: "Name is required." }),
    username: z.string({ required_error: "Username is required." }),
    email: z
      .string({ required_error: "Email is required." })
      .email("Invalid email."),
    password: z.string({ required_error: "Password is required." }),
  });

  const parse = schema.safeParse(req.body);

  if (!parse.success) return res.status(400).send(parse.error.format());

  const { name, username, email, password } = req.body as z.infer<
    typeof schema
  >;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    if (existingUser.username === username)
      return res.status(400).send({ message: "Username already taken." });

    if (existingUser.email === email)
      return res.status(400).send({ message: "Email already taken." });
  }

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: await hash(password, 10),
    },
  });

  return res.status(200).send(_.omit(user, ["password"]));
};

export const loginUser: RequestHandler = async (req, res) => {
  const schema = z
    .object({
      username: z.string().optional(),
      email: z.string().email("Invalid email.").optional(),
      password: z.string(),
    })
    .refine(({ email, username }) => email || username, {
      message: "Please provide a username or email.",
    });

  const parse = schema.safeParse(req.body);

  if (!parse.success) return res.status(400).send(parse.error.format());

  const { username, email, password } = req.body as z.infer<typeof schema>;

  const existingUser = await prisma.user.findFirst({
    where: username ? { username } : email ? { email } : {},
  });

  if (!existingUser)
    return res.status(400).send({ message: "Account doesn't exist." });

  const correctPassword = await compare(password, existingUser.password);

  if (!correctPassword)
    return res.status(401).send({ message: "Incorrect password." });

  req.session.sid = existingUser.id;

  return res.status(200).send(_.omit(existingUser, ["password"]));
};
