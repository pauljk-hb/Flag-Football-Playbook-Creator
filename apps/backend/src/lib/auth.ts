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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.playbook.create({
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
          console.log(`✅ Setup für neuen User ${user.email} abgeschlossen!`);
        },
      },
    },
  },
});
