import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, CreditCard, Bell, Lock } from "lucide-react";

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "INR", label: "INR (₹)" },
  { value: "JPY", label: "JPY (¥)" },
  { value: "CAD", label: "CAD ($)" },
  { value: "AUD", label: "AUD ($)" },
];

export default function Settings() {
  const { data: profile, updateProfile } = useProfile();
  const { user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setCurrency(profile.currency);
      setEmailNotif(profile.notification_email);
      setInAppNotif(profile.notification_in_app);
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfile.mutate({ full_name: fullName, currency, notification_email: emailNotif, notification_in_app: inAppNotif });
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setNewPassword(""); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
          </div>
          <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>Save Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4" /> Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currency} onValueChange={(v) => { setCurrency(v); updateProfile.mutate({ currency: v }); }}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {currencies.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive budget alerts and summaries via email</p>
            </div>
            <Switch checked={emailNotif} onCheckedChange={(v) => { setEmailNotif(v); updateProfile.mutate({ notification_email: v }); }} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">In-App Notifications</p>
              <p className="text-xs text-muted-foreground">Show notifications in the app</p>
            </div>
            <Switch checked={inAppNotif} onCheckedChange={(v) => { setInAppNotif(v); updateProfile.mutate({ notification_in_app: v }); }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Lock className="h-4 w-4" /> Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} maxLength={128} />
          </div>
          <Button onClick={handleChangePassword} variant="outline">Change Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
