import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { auth } from "../utils/auth";
import { db } from "../utils/supabase";
import { dodo } from "../utils/dodopayments";

import {
  Webhook,
  type WebhookUnbrandedRequiredHeaders,
} from "standardwebhooks";
import { getSlugByProductId } from "../helper/getSlugById";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.on(["POST", "GET"], "/api/auth/**", async (c) => {
  return await auth.handler(c.req.raw);
});

const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_SECRET as string);

app.get("/user", async (c) => {
  const session = c.get("session");

  if (!session || !session.userId) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  // Fetch the logged in user from DB
  const user = c.get("user");

  return c.json({ user: user }, 200);
});

app.get("/create-customer", async (c) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    if (user.customerId) {
      return c.json({
        message: "Customer already exists",
        customerId: user.customerId,
      });
    }

    const result = await dodo.createCustomer(user.email, user.name);

    if (result.type === "error") {
      return c.json({ message: "Error" }, 400);
    }

    const response = await db.updateUserId(user.id, result.data!.customer_id);

    return response.type === "success"
      ? c.json({ message: response.message })
      : c.json({ message: response.message });
  } catch (err) {
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

app.post("/create-subscription", async (c) => {
  try {
    const user = c.get("user");
    const { product_slug } = await c.req.json();

    if (!user) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const result = await dodo.createCheckoutSession(
      user.customerId,
      product_slug,
    );

    if (result.type == "error") {
      return c.json({ message: "error" });
    }

    return result.type === "success"
      ? c.json({
          message: "Success",
          payment_link: result.data!.checkout_url,
        })
      : c.json({
          message: "error",
        });
  } catch (err) {
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

app.post("/change-plan", async (c) => {
  try {
    const user = c.get("user");
    const { product_slug } = await c.req.json();

    if (!user) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const result = await dodo.changePlan(
      user.customerId,
      user.subscriptionId,
      product_slug,
    );

    return result.type === "success"
      ? c.json({
          message: "success",
        })
      : c.json({
          message: "error",
        });
  } catch (err) {
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

app.get("/portal", async (c) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const result = await dodo.createCustomerPortal(user?.customerId);
    console.log(result);
    return result.type === "success"
      ? c.json({
          type: result.type,
          portal_link: result.data?.portal_url,
        })
      : c.json({
          type: result.type,
        });
  } catch (err) {
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

app.post("/webhook", async (c) => {
  try {
    const body = await c.req.json();

    const webhookHeaders: WebhookUnbrandedRequiredHeaders = {
      "webhook-id": (c.req.header("webhook-id") || "") as string,
      "webhook-signature": (c.req.header("webhook-signature") || "") as string,
      "webhook-timestamp": (c.req.header("webhook-timestamp") || "") as string,
    };

    const raw = JSON.stringify(body);

    const samePayloadOutput = await webhook.verify(raw, webhookHeaders);

    if (samePayloadOutput == body) {
      switch (body.type) {
        case "subscription.active":
          await db.updateUserPlan(
            body.data.customer.customer_id,
            body.data.subscription_id,
            getSlugByProductId(body.data.product_id),
            body.data.expires_at,
            body.data.status,
          );
          break;
        case "subscription.expired":
          await db.updateUserPlan(
            body.data.customer.customer_id,
            body.data.subscription_id,
            getSlugByProductId(body.data.product_id),
            body.data.expires_at,
            body.data.status,
          );
          break;
        case "subscription.renewed":
          await db.updateUserPlan(
            body.data.customer.customer_id,
            body.data.subscription_id,
            getSlugByProductId(body.data.product_id),
            body.data.expires_at,
            body.data.status,
          );
          break;
        case "subscription.plan_changed":
          await db.updateUserPlan(
            body.data.customer.customer_id,
            body.data.subscription_id,
            getSlugByProductId(body.data.product_id),
            body.data.expires_at,
            body.data.status,
          );
          break;
        case "subscription.cancelled":
          await db.updateUserPlan(
            body.data.customer.customer_id,
            body.data.subscription_id,
            getSlugByProductId(body.data.product_id),
            body.data.expires_at,
            body.data.status,
          );
          break;
      }
    }

    return c.json({ received: true }, 200);
  } catch (error) {
    console.error("Error processing webhook:", error);
    return c.json({ error: "Webhook handler failed" }, 400);
  }
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
