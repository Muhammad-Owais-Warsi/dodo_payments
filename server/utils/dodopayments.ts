import DodoPayments from "dodopayments";

export const PRODUCTS = {
  basic: {
    product_id: "pdt_Y0UMg8bPfhJVsLDLigPqg",
    product_slug: "basic",
  },
  premium: {
    product_id: "pdt_Y0UMg8bPfhJVsLDLigPqg",
    product_slug: "premium",
  },
  "premium+": {
    product_id: "pdt_6vhx7D9VoM4W71AfPw4Sq",
    product_slug: "premium+",
  },
};

export type ProductSlug = keyof typeof PRODUCTS;

export type BillingDetails = {
  city: string;
  country: DodoPayments.Misc.CountryCode;
  state: string;
  street: string;
  zipcode: string;
};

type Response = {
  type: "error" | "success";
  data?: Record<string, string>;
};

class Dodo {
  dodo;
  constructor() {
    this.dodo = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY as string,
      environment: "test_mode",
    });
  }

  async createCustomer(email: string, name: string): Promise<Response> {
    try {
      const res = await this.dodo.customers.create({
        email: email,
        name: name,
      });

      return {
        type: "success",
        data: {
          customer_id: res.customer_id,
        },
      };
    } catch (error) {
      return {
        type: "error",
      };
    }
  }

  async createSubscription(
    customer_id: string,
    product_slug: ProductSlug,
    billing_details: BillingDetails,
  ): Promise<Response> {
    try {
      const res = await this.dodo.subscriptions.create({
        payment_link: true,
        billing: {
          city: billing_details.city,
          country: billing_details.country,
          state: billing_details.state,
          street: billing_details.street,
          zipcode: billing_details.zipcode,
        },
        customer: { customer_id: customer_id },
        product_id: PRODUCTS[product_slug].product_id,
        quantity: 1,
        metadata: {
          plan: PRODUCTS[product_slug].product_slug,
        },
      });

      return {
        type: "success",
        data: {
          payment_link: res.payment_link!,
          subscription_id: res.subscription_id,
        },
      };
    } catch (error) {
      return {
        type: "error",
      };
    }
  }

  async createCheckoutSession(
    customer_id: string,
    product_slug: ProductSlug,
  ): Promise<Response> {
    try {
      const res = await this.dodo.checkoutSessions.create({
        product_cart: [
          { product_id: PRODUCTS[product_slug].product_id, quantity: 1 },
        ],
        return_url: "http://localhost:5173/home",
        customer: {
          customer_id: customer_id,
        },
      });
      return {
        type: "success",
        data: {
          checkout_url: res.checkout_url,
        },
      };
    } catch (err) {
      return {
        type: "error",
      };
    }
  }

  async changePlan(
    customer_id: string,
    subscription_id: string,
    product_slug: keyof typeof PRODUCTS,
  ): Promise<Response> {
    try {
      await this.dodo.subscriptions.changePlan(subscription_id, {
        product_id: PRODUCTS[product_slug].product_id,
        proration_billing_mode: "prorated_immediately",
        quantity: 1,
      });

      return {
        type: "success",
      };
    } catch (error) {
      return {
        type: "error",
      };
    }
  }

  async createCustomerPortal(customer_id: string): Promise<Response> {
    try {
      const res = await this.dodo.customers.customerPortal.create(customer_id);
      return {
        type: "success",
        data: {
          portal_url: res.link,
        },
      };
    } catch (error) {
      return {
        type: "error",
      };
    }
  }
}

export const dodo = new Dodo();
