import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import "dotenv/config";
import {
  ensureUserHasDefaults,
  setupNewUserWorkspace,
} from "../modules/userSetup/userSetup.service.js";
import { prisma } from "./prisma.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  baseURL: process.env.SERVER_URL,
  trustedOrigins: [process.env.CLIENT_URL as string],
  advanced: {
    useSecureCookies: false,
  },
  user: {
    additionalFields: {
      lastPlaybookId: {
        type: "string",
        required: false,
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          console.log(
            `Neuer User registriert: ${user.id}. Richte Workspace ein...`,
          );
          await setupNewUserWorkspace(user.id);
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          console.log(
            `User ${session.userId} hat sich eingeloggt. Prüfe auf fehlende Updates...`,
          );

          await ensureUserHasDefaults(session.userId);
        },
      },
    },
  },
});
