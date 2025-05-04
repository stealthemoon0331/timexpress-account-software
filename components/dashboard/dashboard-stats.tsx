"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useUser } from "@/app/contexts/UserContext";
import { getPlanTitle, isPlanExpired } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Plan } from "@/lib/data";

export function DashboardStats() {
  const { user: loggedUser, loading } = useUser();

  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [plan, setPlan] = useState<Plan>();

  useEffect(() => {
    const syncPlans = async () => {
      try {
        const res = await fetch("/api/payment/plans", { method: "GET" });
        if (!res.ok) throw new Error("Failed to sync plans");

        const responseData = await res.json();

        const parsedPlans = responseData.map((plan: any) => ({
          ...plan,
          features:
            typeof plan.features === "string"
              ? JSON.parse(plan.features)
              : plan.features,
        }));

        setPlans(parsedPlans);
      } catch (err) {
        console.error("Error loading plans:", err);
      }
    };

    syncPlans();
  }, []);

  useEffect(() => {
    if (plans && loggedUser?.planId) {
      setPlan(plans.find((p) => p.id === loggedUser.planId));
    }
  }, [plans, loggedUser?.planId]);

  if (loading || !loggedUser) return null;

  const { planId, planExpiresAt } = loggedUser;

  const planTitle = plan?.name ?? getPlanTitle(plans || [], planId);
  const isExpired = isPlanExpired(planExpiresAt);
  const daysLeft = planExpiresAt
    ? Math.max(0, Math.ceil((new Date(planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const stats = [
    {
      title: "Subscription Status",
      value: !isExpired ? "Active" : "Expired",
      icon: Icons.creditCard,
      bottom: `${planTitle}${daysLeft > 0 ? ` (${daysLeft} days remaining)` : ""}`,
    },
    {
      title: "Current Plan",
      value: planTitle,
      icon: Icons.package,
      bottom: planId === "free-trial" ? "All Features Included" : "Custom plan features",
    },
    {
      title: "Next Billing Date",
      value: !isExpired && planExpiresAt
        ? format(new Date(planExpiresAt), "MMMM d, yyyy")
        : "-",
      icon: Icons.calendar,
      bottom: planId === "free-trial" ? "$15/month after trial" : "See billing section",
    },
    {
      title: "Features",
      value: plan?.features?.length ?? "0",
      icon: Icons.grid,
      bottom: plan?.features?.join(", ") ?? "No features listed",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </div>
              <div className="rounded-full bg-upwork-lightgreen p-2">
                <stat.icon className="h-5 w-5 text-upwork-green" />
              </div>
            </div>
          </CardContent>
          <CardFooter>{stat.bottom}</CardFooter>
        </Card>
      ))}
    </div>
  );
}

