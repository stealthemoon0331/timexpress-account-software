import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Plan, plans as initialPlans } from "@/lib/data";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { CheckCircle } from "lucide-react";
import Select from "react-select";

const allSystems = [
  { value: "CRM", label: "CRM" },
  { value: "WMS", label: "WMS" },
  { value: "FMS", label: "FMS" },
];

export function AdminSubscriptionsTab() {
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [newPlanData, setNewPlanData] = useState<any | null>(null);
  const [newSystem, setNewSystem] = useState("");

  const [newFeature, setNewFeature] = useState<string>("");
  const [loadingPlans, setLoadingPlans] = useState<{ [id: string]: boolean }>(
    {}
  );
  const [plans, setPlans] = useState<Plan[] | null>(initialPlans);

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
        if (parsedPlans.length === 0) {
          setPlans(initialPlans);
        } else {
          setPlans(parsedPlans);
        }
      } catch (err) {
        console.error("Error loading plans:", err);
      }
    };

    syncPlans();
  }, []);

  const handleCreatePayPalPlan = async (plan: any) => {
    setLoadingPlans((prev) => ({ ...prev, [plan.id]: true }));
    try {
      const res = await fetch("/api/admin/payment/paypal/create-paypal-plan", {
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
      const res = await fetch("/api/admin/payment/paypal/update-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPlans((prevPlans) =>
        (prevPlans || []).map((plan) =>
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

  const handleFeatureDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || !newPlanData) return;

    const updated = Array.from(newPlanData.features);
    const [moved] = updated.splice(source.index, 1);
    updated.splice(destination.index, 0, moved);

    setNewPlanData({ ...newPlanData, features: updated });
  };

  // const handleAddSystem = () => {
  //   if (newSystem.trim() === "") return;
  //   setNewPlanData({
  //     ...newPlanData,
  //     systems: [...newPlanData.systems, newSystem.trim()],
  //   });
  //   setNewSystem("");
  // };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans?.map((plan) => {
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
                  <DragDropContext onDragEnd={handleFeatureDragEnd}>
                    <Droppable droppableId="features" isDropDisabled={false}>
                      {(provided: any) => (
                        <ul
                          className="space-y-2"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {newPlanData.features.map((f: string, i: number) => (
                            <Draggable
                              key={i}
                              draggableId={`feature-${i}`}
                              index={i}
                            >
                              {(provided: any) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-2"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <span
                                    {...provided.dragHandleProps}
                                    className="cursor-grab text-gray-400 select-none"
                                    title="Drag to reorder"
                                  >
                                    ☰
                                  </span>
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
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <Select
                    isMulti
                    options={allSystems}
                    value={allSystems.filter((opt) =>
                      newPlanData.systems?.includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setNewPlanData({
                        ...newPlanData,
                        systems: selected.map((opt) => opt.value),
                      })
                    }
                  />

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
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-upwork-green mt-1" />
                        <span>{f}</span>
                      </li>
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
