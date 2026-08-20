import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import "dotenv/config";
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
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const firstPlaybook = await prisma.playbook.create({
            data: {
              userId: user.id,
              name: "Mein erstes Playbook",
              description: "Standard-Playbook (automatisch generiert)",
              tags: {
                create: [
                  { name: "Short Yard", color: "#3b82f6" },
                  { name: "Long Yard", color: "#22c55e" }, // Grün
                  { name: "Redzone", color: "#ef4444" }, // Rot
                ],
              },
            },
          });

          await prisma.user.update({
            where: { id: user.id },
            data: { lastPlaybookId: firstPlaybook.id },
          });

          await Promise.all([
            prisma.exportPreset.createMany({
              data: [
                {
                  userId: user.id,
                  name: "A4 Hochkant (6 Spielzüge)",
                  pageWidth: 210,
                  pageHeight: 297,
                  columns: 2,
                  rows: 3,
                  gap: 10,
                  marginTop: 15,
                  marginRight: 15,
                  marginBottom: 15,
                  marginLeft: 15,
                  routeStrokeWidth: 2,
                  showLabels: true,
                },
                {
                  userId: user.id,
                  name: "A4 Querformat (Groß)",
                  pageWidth: 297,
                  pageHeight: 210,
                  columns: 2,
                  rows: 1,
                  gap: 15,
                  marginTop: 20,
                  marginRight: 20,
                  marginBottom: 20,
                  marginLeft: 20,
                  routeStrokeWidth: 3,
                  showLabels: false,
                },
              ],
            }),
          ]);
        },
      },
    },
  },
});
