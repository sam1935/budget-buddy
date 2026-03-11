import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Notifications() {
  const { data: notifications, markRead, markAllRead, unreadCount } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {(notifications ?? []).length > 0 ? (
            <div className="space-y-3">
              {(notifications ?? []).map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${n.is_read ? "border-border bg-card" : "border-primary/30 bg-primary/5"}`}
                  onClick={() => !n.is_read && markRead.mutate(n.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.created_at), "MMM d, yyyy h:mm a")}</p>
                      </div>
                    </div>
                    {!n.is_read && <Badge className="shrink-0">New</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No notifications yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
