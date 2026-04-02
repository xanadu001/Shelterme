import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Phone, 
  GraduationCap,
  LogOut,
  Edit2,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  university: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    email: "",
    phone: "",
    university: "",
  });
  const [editedProfile, setEditedProfile] = useState<Profile>(profile);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/", { replace: true });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/", { replace: true });
      } else {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        const profileData = {
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          university: data.university || "",
        };
        setProfile(profileData);
        setEditedProfile(profileData);
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
        .update({
          full_name: editedProfile.full_name,
          phone: editedProfile.phone,
          university: editedProfile.university,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile(editedProfile);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setEditing(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 pt-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">My Profile</h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-4 -mt-12">
        <div className="bg-background rounded-2xl shadow-lg p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-primary">
                {getInitials(profile.full_name)}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {profile.full_name || "User"}
            </h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>

          {/* Edit/Save Buttons */}
          <div className="flex justify-end mb-4">
            {editing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Check className="w-4 h-4 mr-1" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-2 mb-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                Full Name
              </Label>
              {editing ? (
                <Input
                  value={editedProfile.full_name}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, full_name: e.target.value })
                  }
                />
              ) : (
                <p className="text-foreground font-medium py-2 px-3 bg-muted/50 rounded-lg">
                  {profile.full_name || "—"}
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-2 mb-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email Address
              </Label>
              <p className="text-foreground font-medium py-2 px-3 bg-muted/50 rounded-lg">
                {profile.email || "—"}
              </p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-2 mb-1.5">
                <Phone className="w-3.5 h-3.5" />
                Phone Number
              </Label>
              {editing ? (
                <Input
                  value={editedProfile.phone}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, phone: e.target.value })
                  }
                />
              ) : (
                <p className="text-foreground font-medium py-2 px-3 bg-muted/50 rounded-lg">
                  {profile.phone || "—"}
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-2 mb-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                University
              </Label>
              {editing ? (
                <Input
                  value={editedProfile.university}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, university: e.target.value })
                  }
                />
              ) : (
                <p className="text-foreground font-medium py-2 px-3 bg-muted/50 rounded-lg">
                  {profile.university || "—"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          className="w-full mt-6 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;