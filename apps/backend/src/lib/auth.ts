import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma";
import "dotenv/config";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.SERVER_URL,
  trustedOrigins: [process.env.CLIENT_URL as string],
  advanced: {
    useSecureCookies: false,
  },
});
