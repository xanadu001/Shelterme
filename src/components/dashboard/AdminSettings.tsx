import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User as UserIcon } from "lucide-react";

interface AdminSettingsProps {
  user: User | null;
}

const AdminSettings = ({ user }: AdminSettingsProps) => {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdating(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Password updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast({ title: "Error", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setUpdatingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setUpdatingEmail(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Verification Sent", description: "Check your new email to confirm the change." });
      setNewEmail("");
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-xl font-bold text-foreground">Admin Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your admin account</p>
      </div>

      {/* Current Account Info */}
      <div className="bg-background border border-border rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <UserIcon className="w-4 h-4" /> Account Info
        </h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><span className="font-medium text-foreground">Email:</span> {user?.email}</p>
          <p><span className="font-medium text-foreground">Last Sign In:</span> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "N/A"}</p>
        </div>
      </div>

      {/* Change Email */}
      <div className="bg-background border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Mail className="w-4 h-4" /> Change Email
        </h3>
        <div className="space-y-2">
          <Label htmlFor="new-email" className="text-xs text-muted-foreground">New Email Address</Label>
          <Input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="newemail@example.com"
          />
        </div>
        <Button onClick={handleEmailChange} disabled={updatingEmail} size="sm">
          {updatingEmail ? "Updating..." : "Update Email"}
        </Button>
      </div>

      {/* Change Password */}
      <div className="bg-background border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Lock className="w-4 h-4" /> Change Password
        </h3>
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-xs text-muted-foreground">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-xs text-muted-foreground">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <Button onClick={handlePasswordChange} disabled={updating} size="sm">
          {updating ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
