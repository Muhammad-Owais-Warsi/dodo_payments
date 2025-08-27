import { betterAuth } from "better-auth";
import { Pool } from "pg";
import DodoPayments from "dodopayments";

export const dodoPayments = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY as string,
  environment: "test_mode",
});

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),

  user: {
    additionalFields: {
      customerId: {
        type: "string",
      },
      subscriptionId: {
        type: "string",
      },
      plan: {
        type: "string",
      },
      validity: {
        type: "string",
      },
      status: {
        type: "string",
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: ["http://localhost:5173"],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
