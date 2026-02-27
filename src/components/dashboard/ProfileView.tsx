import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Building2, 
  LogOut, 
  Save,
  Shield,
  Edit2
} from "lucide-react";

interface ProfileViewProps {
  user: User | null;
  onLogout: () => void;
}

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  university: string;
}

interface RoleData {
  role: string;
  company_name: string | null;
  phone: string | null;
  verified: boolean;
}

const ProfileView = ({ user, onLogout }: ProfileViewProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone: "",
    university: "",
  });
  const [roleData, setRoleData] = useState<RoleData | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user?.id)
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user?.id)
          .maybeSingle()
      ]);

      if (profileResult.data) {
        setProfile({
          full_name: profileResult.data.full_name || "",
          email: profileResult.data.email || user?.email || "",
          phone: profileResult.data.phone || "",
          university: profileResult.data.university || "",
        });
      } else {
        setProfile(prev => ({
          ...prev,
          email: user?.email || "",
        }));
      }

      if (roleResult.data) {
        setRoleData(roleResult.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          university: profile.university,
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AG";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your account settings</p>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>

      {/* Avatar & Basic Info */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
        <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
          {getInitials(profile.full_name)}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{profile.full_name || "Agent"}</h3>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          {roleData && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                {roleData.role}
              </span>
              {roleData.verified && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-muted-foreground" />
            Full Name
          </Label>
          <Input
            id="fullName"
            value={profile.full_name}
            onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
            disabled={!isEditing}
            className="h-12 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            disabled
            className="h-12 rounded-xl bg-muted"
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
            disabled={!isEditing}
            className="h-12 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="university" className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Area of Operation
          </Label>
          <Input
            id="university"
            value={profile.university}
            onChange={(e) => setProfile(prev => ({ ...prev, university: e.target.value }))}
            disabled={!isEditing}
            className="h-12 rounded-xl"
          />
        </div>

        {roleData?.company_name && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Lodge Name
            </Label>
            <Input
              value={roleData.company_name}
              disabled
              className="h-12 rounded-xl bg-muted"
            />
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="pt-4 border-t border-border">
        <Button 
          variant="destructive" 
          className="w-full h-12 rounded-xl"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default ProfileView;
