import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { plans as initialPlans } from "@/lib/data";

export function AdminSubscriptionsTab() {
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [newPlanData, setNewPlanData] = useState<any | null>(null);
  const [newFeature, setNewFeature] = useState<string>("");
  const [loadingPlans, setLoadingPlans] = useState<{ [id: string]: boolean }>(
    {}
  );
  const [plans, setPlans] = useState(() =>
    initialPlans.map((plan) => ({
      ...plan,
      price: parseFloat(plan.price.replace(/[^\d.]/g, "")), // convert "$29/month" → 29
    }))
  );

  const handleCreatePayPalPlan = async (plan: any) => {
    setLoadingPlans((prev) => ({ ...prev, [plan.id]: true }));
    try {
      const res = await fetch("/api/admin/create-paypal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to create PayPal plan");
      toast.success(`PayPal plan created: ${data.planId}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingPlans((prev) => ({ ...prev, [plan.id]: false }));
    }
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlanId(plan.id);
    setNewPlanData({
      ...plan,
      price: plan.price?.toString?.() || "", // make sure price is string for input
      features: [...(plan.features || [])],
    });
  };

  const handleSaveEdit = async () => {
    if (!newPlanData) return;
    console.log(
      "newPlanData.price => ",
      newPlanData.price.replace(/[^0-9.]/g, "")
    );
    const payload = {
      ...newPlanData,
      price: parseFloat(newPlanData.price.replace(/[^0-9.]/g, "")),
    };

    setLoadingPlans((prev) => ({ ...prev, [newPlanData.id]: true }));
    try {
      console.log("payload => ", payload);
      const res = await fetch("/api/admin/update-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.id === payload.id ? { ...plan, ...payload } : plan
        )
      );
      
      toast.success("Plan updated successfully!");
      setEditingPlanId(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingPlans((prev) => ({ ...prev, [newPlanData.id]: false }));
    }
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
    setNewFeature("");
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setNewPlanData((prev: any) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updated = [...newPlanData.features];
    updated.splice(index, 1);
    setNewPlanData({ ...newPlanData, features: updated });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const isEditing = editingPlanId === plan.id;
        const isLoading = loadingPlans[plan.id] || false;

        return (
          <Card
            key={plan.id}
            className="shadow-md hover:shadow-lg transition duration-200"
          >
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={newPlanData.name}
                    onChange={(e) =>
                      setNewPlanData({ ...newPlanData, name: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Plan name"
                  />
                  <textarea
                    value={newPlanData.description}
                    onChange={(e) =>
                      setNewPlanData({
                        ...newPlanData,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Description"
                  />
                  <input
                    type="text"
                    value={newPlanData.price}
                    onChange={(e) =>
                      setNewPlanData({ ...newPlanData, price: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Price"
                  />
                  <ul className="space-y-2">
                    {newPlanData.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={f}
                          onChange={(e) => {
                            const updated = [...newPlanData.features];
                            updated[i] = e.target.value;
                            setNewPlanData({
                              ...newPlanData,
                              features: updated,
                            });
                          }}
                          className="w-full p-2 border rounded"
                        />
                        <Button
                          variant="destructive"
                          onClick={() => handleRemoveFeature(i)}
                        >
                          ✕
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="New feature"
                    />
                    <Button onClick={handleAddFeature}>Add</Button>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSaveEdit}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-semibold">Price: $ {plan.price}</p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {plan.features.map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                  <div className="pt-4 space-y-2">
                    <Button
                      onClick={() => handleCreatePayPalPlan(plan)}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create PayPal Plan"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleEditPlan(plan)}
                    >
                      Edit
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
