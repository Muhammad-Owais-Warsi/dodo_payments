import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";

export interface Plan {
  product_slug: string;
  title: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  currency: string;
  badge?: string;
}

const plans: Plan[] = [
  {
    product_slug: "basic",
    title: "Basic",
    description: "For testing locally",
    monthlyPrice: "5",
    yearlyPrice: "0",
    currency: "$",
  },
  {
    product_slug: "premium",
    title: "Premium",
    description: "For teams in production",
    monthlyPrice: "20",
    yearlyPrice: "199",
    currency: "$",
    badge: "Most Popular",
  },
  {
    product_slug: "premium+",
    title: "Premium+",
    description: "For organizations",
    monthlyPrice: "100",
    yearlyPrice: "Custom",
    currency: "$",
  },
];

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customerCreated, setCustomerCreated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const session = await axios.get("http://localhost:3000/user", {
          withCredentials: true,
        });
        if (!session.data.user) return navigate("/");

        setUser(session.data.user);

        // 1️⃣ Ensure customer exists
        if (!session.data.user.customerId) {
          const createCustomer = await axios.get(
            "http://localhost:3000/create-customer",
            { withCredentials: true },
          );
          if (createCustomer.data.customerId) setCustomerCreated(true);
        } else {
          setCustomerCreated(true);
        }

        // 2️⃣ Set current plan if exists
        if (session.data.user.plan) {
          const matched = plans.find(
            (p) => p.product_slug === session.data.user.plan,
          );
          if (matched) setCurrentPlan(matched);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [navigate]);

  const handleSelectPlan = async (plan: Plan) => {
    try {
      if (!user) return;

      if (!currentPlan) {
        // New subscription
        const res = await axios.post(
          "http://localhost:3000/create-subscription",
          { product_slug: plan.product_slug },
          { withCredentials: true },
        );
        if (res.data.payment_link) window.location.href = res.data.payment_link;
      } else {
        // Change plan
        const res = await axios.post(
          "http://localhost:3000/change-plan",
          { product_slug: plan.product_slug },
          { withCredentials: true },
        );
        if (res.data.message === "success") {
          alert("Plan changed successfully!");
          setCurrentPlan(plan);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error processing plan selection");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!customerCreated) return <p>Creating customer, please wait...</p>;

  return (
    <div className="min-h-screen bg-background p-8">
      <h2 className="text-3xl font-bold text-center mb-10">Choose Your Plan</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentPlan?.product_slug === plan.product_slug;
          return (
            <Card
              key={plan.product_slug}
              className={`p-6 flex flex-col justify-between ${isCurrent ? "border-primary shadow-lg" : ""}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{plan.title}</h3>
                  {plan.badge && (
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
                <p className="mt-4 text-2xl font-bold">
                  {plan.currency}
                  {plan.monthlyPrice}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mo
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  or {plan.currency}
                  {plan.yearlyPrice}/year
                </p>
              </div>
              <Button
                className="mt-6"
                variant={isCurrent ? "outline" : "default"}
                disabled={isCurrent}
                onClick={() => handleSelectPlan(plan)}
              >
                {isCurrent
                  ? "Current Plan"
                  : currentPlan
                    ? "Change Plan"
                    : "Subscribe"}
              </Button>
            </Card>
          );
        })}
        <Button
          onClick={async () => {
            try {
              const res = await axios.get("http://localhost:3000/portal", {
                withCredentials: true,
              });
              console.log(res);
              if (res.data.portal_link) {
                window.location.href = res.data.portal_link;
              } else {
                alert("Could not open portal");
              }
            } catch (err) {
              console.error(err);
              alert("Error opening customer portal");
            }
          }}
        >
          Manage Subscription
        </Button>
      </div>
    </div>
  );
}
