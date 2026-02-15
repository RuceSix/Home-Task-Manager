import { useEffect, useState } from "react";
import { useHomeStore } from "@/store/homeStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";

export default function Devices() {
  // ✅ DENTRO IL COMPONENTE
  const { devices, loading, loadData, toggleDevice, addDevice } =
    useHomeStore();

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loading />;

  if (devices.length === 0) {
    return (
      <EmptyState
        title="No devices"
        description="Add your first device"
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Devices</h1>

      {/* ➕ ADD DEVICE */}
     
       <Card>
  <CardHeader>
    <CardTitle>Add Device</CardTitle>
  </CardHeader>
  <CardContent className="flex gap-2">
    <Input
      placeholder="Device name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
    <Input
      placeholder="Room"
      value={room}
      onChange={(e) => setRoom(e.target.value)}
    />
    <Button
      onClick={() => {
        addDevice(name, room);
        setName("");
        setRoom("");
      }}
    >
      Add
    </Button>
  </CardContent>
</Card>
     

      {/* 📋 LISTA DEVICES */}
      <div className="grid gap-4">
        {devices.map((device) => (
          <Card key={device.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{device.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {device.room}
                </p>
              </div>
              <Switch
                checked={device.status}
                onCheckedChange={() =>
                  toggleDevice(device.id)
                }
              />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

