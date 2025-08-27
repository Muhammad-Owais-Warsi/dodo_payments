import { createClient } from "@supabase/supabase-js";

type Response = {
  type: "error" | "success";
  message: string;
};

class Supabase {
  supabase;
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string,
    );
  }

  async updateUserId(userId: string, customerId: string): Promise<Response> {
    const { error } = await this.supabase
      .from("user")
      .update({
        customerId: customerId,
      })
      .eq("id", userId);

    return error
      ? { type: "error", message: error.message }
      : { type: "success", message: "Created successfuly" };
  }

  async updateUserPlan(
    customerId: string,
    subscriptionId: string,
    product_slug: string,
    validity: string,
    status: string,
  ): Promise<Response> {
    console.log({
      customerId,
      subscriptionId,
      product_slug,
      validity,
      status,
    });
    const { error } = await this.supabase
      .from("user")
      .update({
        subscriptionId: subscriptionId,
        plan: product_slug,
        validity: validity,
        status: status,
      })
      .eq("customerId", customerId);

    console.log("done");
    console.log("Supabase update error:", error);

    return error
      ? { type: "error", message: error.message }
      : { type: "success", message: "Updated successfuly" };
  }
}

export const db = new Supabase();
