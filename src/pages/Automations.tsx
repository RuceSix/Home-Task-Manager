import { useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useHomeStore } from "@/store/homeStore";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";

export default function Automations() {
  const { automations, loading, loadData, toggleAutomation } =
    useHomeStore();

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loading />;

  if (automations.length === 0) {
    return (
      <EmptyState
        title="No automations yet"
        description="Create automations to make your home smarter."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Automations</h1>

      <div className="grid gap-4">
        {automations.map((automation) => (
          <Card key={automation.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {automation.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {automation.description}
                </p>
              </div>
              <Switch
                checked={automation.enabled}
                onCheckedChange={() =>
                  toggleAutomation(automation.id)
                }
              />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

