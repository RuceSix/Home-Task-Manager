import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Devices online</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">3</p>
            <p className="text-muted-foreground text-sm">
              Active smart devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active automations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">2</p>
            <p className="text-muted-foreground text-sm">
              Automations currently running
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
