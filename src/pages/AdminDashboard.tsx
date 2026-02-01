import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Building2, 
  CalendarCheck, 
  TrendingUp,
  Shield,
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  LogOut,
  ClipboardCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Search,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  Ban
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalLandlords: number;
  totalProperties: number;
  totalBookings: number;
  pendingVerifications: number;
  pendingInspections: number;
}

interface UserWithRole {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  university: string;
  created_at: string;
  role?: string;
  verified?: boolean;
  company_name?: string;
  suspended?: boolean;
}

interface PropertyData {
  id: string;
  title: string;
  location: string;
  price: number;
  is_verified: boolean;
  is_available: boolean;
  created_at: string;
  images: string[];
  owner_id: string;
  bedrooms: number;
  bathrooms: number;
}

interface BookingData {
  id: string;
  listing_id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  university: string;
  move_in_date: string;
  rent_amount: number;
  service_fee: number;
  total_amount: number;
  payment_status: string;
  payment_reference: string | null;
  inspection_status: string | null;
  inspection_date: string | null;
  inspection_notes: string | null;
  created_at: string;
  property?: PropertyData;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalLandlords: 0,
    totalProperties: 0,
    totalBookings: 0,
    pendingVerifications: 0,
    pendingInspections: 0,
  });
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth?mode=admin-login");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth?mode=admin-login");
      } else {
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminRole = async (userId: string) => {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleData?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchAllData();
  };

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchProperties(),
        fetchBookings(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const [
      { count: propertiesCount },
      { count: pendingCount },
      { count: bookingsCount },
      { count: usersCount },
      { count: studentsCount },
      { count: landlordsCount },
      { count: pendingInspectionsCount },
    ] = await Promise.all([
      supabase.from("properties").select("*", { count: "exact", head: true }),
      supabase.from("properties").select("*", { count: "exact", head: true }).eq("is_verified", false),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("user_roles").select("*", { count: "exact", head: true }).in("role", ["landlord", "agent"]),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("inspection_status", "pending"),
    ]);

    setStats({
      totalUsers: usersCount || 0,
      totalStudents: studentsCount || 0,
      totalLandlords: landlordsCount || 0,
      totalProperties: propertiesCount || 0,
      totalBookings: bookingsCount || 0,
      pendingVerifications: pendingCount || 0,
      pendingInspections: pendingInspectionsCount || 0,
    });
  };

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: roles } = await supabase
      .from("user_roles")
      .select("*");

    const usersWithRoles = (profiles || []).map((profile) => {
      const roleData = roles?.find((r) => r.user_id === profile.id);
      return {
        ...profile,
        role: roleData?.role || "student",
        verified: roleData?.verified || false,
        company_name: roleData?.company_name,
        suspended: roleData?.suspended || false,
      };
    });

    setUsers(usersWithRoles);
  };

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    setProperties(data || []);
  };

  const fetchBookings = async () => {
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch property details for each booking
    const bookingsWithProperties = await Promise.all(
      (bookingsData || []).map(async (booking) => {
        const { data: property } = await supabase
          .from("properties")
          .select("*")
          .eq("id", booking.listing_id)
          .maybeSingle();

        return { ...booking, property };
      })
    );

    setBookings(bookingsWithProperties);
  };

  const handleVerifyProperty = async (propertyId: string, verified: boolean) => {
    try {
      await supabase
        .from("properties")
        .update({ is_verified: verified })
        .eq("id", propertyId);

      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, is_verified: verified } : p))
      );

      toast({
        title: verified ? "Property Verified" : "Property Rejected",
        description: verified
          ? "The property has been verified and is now visible to students."
          : "The property has been rejected.",
      });

      fetchStats();
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: "Failed to update property status.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyUser = async (userId: string, verified: boolean) => {
    try {
      await supabase
        .from("user_roles")
        .update({ verified })
        .eq("user_id", userId);

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, verified } : u))
      );

      toast({
        title: verified ? "User Verified" : "Verification Removed",
        description: verified
          ? "The user has been verified."
          : "User verification has been removed.",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const handleSuspendUser = async (userId: string, suspended: boolean) => {
    try {
      await supabase
        .from("user_roles")
        .update({ suspended })
        .eq("user_id", userId);

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, suspended } : u))
      );

      toast({
        title: suspended ? "User Suspended" : "User Unsuspended",
        description: suspended
          ? "The user has been suspended. Their properties are now hidden from the platform."
          : "The user has been unsuspended. Their properties are now visible.",
      });
    } catch (error) {
      console.error("Error suspending user:", error);
      toast({
        title: "Error",
        description: "Failed to update user suspension status.",
        variant: "destructive",
      });
    }
  };

  const handleInspectionUpdate = async (
    bookingId: string,
    status: string,
    notes?: string
  ) => {
    try {
      // Map UI status to database-valid values
      const dbInspectionStatus = status === "passed" ? "approved" : status === "failed" ? "rejected" : status;
      
      const updateData: any = {
        inspection_status: dbInspectionStatus,
        inspection_date: new Date().toISOString(),
      };

      if (notes) {
        updateData.inspection_notes = notes;
      }

      // If inspection passed, update payment status to verified (releases payment to agent)
      if (status === "passed") {
        updateData.payment_status = "verified";
      }
      
      // If inspection failed, mark payment as rejected (clears pending amount for agent)
      if (status === "failed") {
        updateData.payment_status = "rejected";
      }

      // IMPORTANT: supabase-js does not throw on error; we must check the response.
      const { data: updatedBooking, error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", bookingId)
        .select(
          "id, inspection_status, inspection_date, inspection_notes, payment_status, payment_reference, listing_id, student_name, student_email, student_phone, university, move_in_date, rent_amount, service_fee, total_amount, created_at"
        )
        .maybeSingle();

      if (error) throw error;
      if (!updatedBooking) throw new Error("Booking update failed: no row returned");

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, ...updatedBooking } : b))
      );

      toast({
        title: status === "passed" ? "Inspection Passed" : "Inspection Failed",
        description:
          status === "passed"
            ? "Payment has been released to the landlord."
            : "The booking has been marked as failed. The pending payment has been cleared.",
      });

      fetchStats();
    } catch (error) {
      console.error("Error updating inspection:", error);
      toast({
        title: "Error",
        description: "Failed to update inspection status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || "AD";
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "verified" && u.verified) ||
      (filterStatus === "unverified" && !u.verified) ||
      (filterStatus === "suspended" && u.suspended) ||
      filterStatus === u.role;
    return matchesSearch && matchesFilter;
  });

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "verified" && p.is_verified) ||
      (filterStatus === "pending" && !p.is_verified);
    return matchesSearch && matchesFilter;
  });

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.student_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      filterStatus === b.inspection_status ||
      filterStatus === b.payment_status;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "properties", label: "Properties", icon: Building2 },
    { id: "bookings", label: "Bookings", icon: CalendarCheck },
    { id: "inspections", label: "Inspections", icon: ClipboardCheck },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">ShelterMe Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
            </Button>
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium">
              {getInitials(user?.email || "")}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-background border-b border-border px-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
                setFilterStatus("all");
              }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="p-4 space-y-6 pb-20">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-500" },
                { title: "Students", value: stats.totalStudents, icon: Users, color: "bg-primary" },
                { title: "Landlords", value: stats.totalLandlords, icon: Building2, color: "bg-purple-500" },
                { title: "Properties", value: stats.totalProperties, icon: Building2, color: "bg-indigo-500" },
                { title: "Bookings", value: stats.totalBookings, icon: CalendarCheck, color: "bg-teal-500" },
                { title: "Pending Review", value: stats.pendingVerifications, icon: AlertTriangle, color: "bg-amber-500" },
                { title: "Pending Inspections", value: stats.pendingInspections, icon: ClipboardCheck, color: "bg-orange-500" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-background rounded-xl p-4 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-xl p-5 text-primary-foreground">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Platform Status</span>
              </div>
              <p className="text-2xl font-bold">Active</p>
              <p className="text-sm text-primary-foreground/80">
                All systems operational
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => setActiveTab("properties")}
                >
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="text-xs">Review Properties</span>
                  {stats.pendingVerifications > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {stats.pendingVerifications}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => setActiveTab("inspections")}
                >
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                  <span className="text-xs">Manage Inspections</span>
                  {stats.pendingInspections > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {stats.pendingInspections}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {["all", "student", "landlord", "agent", "verified", "unverified", "suspended"].map(
                  (status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                      className="capitalize whitespace-nowrap"
                    >
                      {status}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="bg-background rounded-xl p-8 text-center border border-border">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className={`bg-background rounded-xl p-4 border ${u.suspended ? 'border-destructive/50 bg-destructive/5' : 'border-border'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-foreground">
                            {u.full_name}
                          </h3>
                          <Badge
                            variant={u.role === "admin" ? "default" : "secondary"}
                            className="capitalize text-xs"
                          >
                            {u.role}
                          </Badge>
                          {u.verified && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                          {u.suspended && (
                            <Badge variant="destructive" className="text-xs">
                              Suspended
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {u.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {u.phone}
                        </div>
                        {u.company_name && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            {u.company_name}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Joined {format(new Date(u.created_at), "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {u.role !== "admin" && (
                          <Button
                            size="sm"
                            variant={u.verified ? "outline" : "default"}
                            onClick={() => handleVerifyUser(u.id, !u.verified)}
                            title={u.verified ? "Remove verification" : "Verify user"}
                          >
                            {u.verified ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        {(u.role === "landlord" || u.role === "agent") && (
                          <Button
                            size="sm"
                            variant={u.suspended ? "outline" : "destructive"}
                            onClick={() => handleSuspendUser(u.id, !u.suspended)}
                            title={u.suspended ? "Unsuspend user" : "Suspend user"}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["all", "pending", "verified"].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredProperties.length === 0 ? (
                <div className="bg-background rounded-xl p-8 text-center border border-border">
                  <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No properties found</p>
                </div>
              ) : (
                filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-background rounded-xl p-4 border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {property.images?.[0] ? (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-foreground text-sm line-clamp-1">
                              {property.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3" />
                              {property.location}
                            </div>
                            <p className="text-sm font-semibold text-primary mt-1">
                              ₦{property.price.toLocaleString()}/year
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {property.bedrooms} bed • {property.bathrooms} bath
                            </p>
                          </div>
                          <Badge
                            variant={property.is_verified ? "default" : "secondary"}
                          >
                            {property.is_verified ? "Verified" : "Pending"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => navigate(`/listing/${property.id}`)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {!property.is_verified && (
                            <>
                              <Button
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() =>
                                  handleVerifyProperty(property.id, true)
                                }
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 text-xs"
                                onClick={() =>
                                  handleVerifyProperty(property.id, false)
                                }
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {["all", "pending", "paid", "verified", "completed"].map(
                  (status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                      className="capitalize whitespace-nowrap"
                    >
                      {status}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="bg-background rounded-xl p-8 text-center border border-border">
                  <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No bookings found</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-background rounded-xl p-4 border border-border"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">
                            {booking.student_name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {booking.property?.title || "Property"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              booking.payment_status === "paid" ||
                              booking.payment_status === "verified"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {booking.payment_status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {booking.student_email}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {booking.student_phone}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Move-in: {format(new Date(booking.move_in_date), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CreditCard className="w-3 h-3" />
                          ₦{booking.total_amount.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          Inspection:
                        </span>
                        <Badge
                          variant={
                            booking.inspection_status === "passed"
                              ? "default"
                              : booking.inspection_status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {booking.inspection_status || "pending"}
                        </Badge>
                      </div>

                      {booking.payment_reference && (
                        <p className="text-xs text-muted-foreground">
                          Ref: {booking.payment_reference}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Inspections Tab */}
        {activeTab === "inspections" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search inspections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["all", "pending", "passed", "failed"].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {bookings.filter((b) =>
                filterStatus === "all"
                  ? true
                  : b.inspection_status === filterStatus ||
                    (filterStatus === "pending" && !b.inspection_status)
              ).length === 0 ? (
                <div className="bg-background rounded-xl p-8 text-center border border-border">
                  <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No inspections found</p>
                </div>
              ) : (
                bookings
                  .filter((b) =>
                    filterStatus === "all"
                      ? true
                      : b.inspection_status === filterStatus ||
                        (filterStatus === "pending" &&
                          (!b.inspection_status || b.inspection_status === "pending"))
                  )
                  .filter(
                    (b) =>
                      b.student_name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      b.property?.title
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-background rounded-xl p-4 border border-border"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">
                              {booking.property?.title || "Property"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Booked by: {booking.student_name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3" />
                              {booking.property?.location}
                            </div>
                          </div>
                          <Badge
                            variant={
                              booking.inspection_status === "approved"
                                ? "default"
                                : booking.inspection_status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {booking.inspection_status || "pending"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {booking.student_phone}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CreditCard className="w-3 h-3" />
                            ₦{booking.total_amount.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Move-in:{" "}
                            {format(new Date(booking.move_in_date), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CreditCard className="w-3 h-3" />
                            Payment: {booking.payment_status}
                          </div>
                        </div>

                        {booking.inspection_notes && (
                          <div className="bg-muted/50 rounded-lg p-3 text-xs">
                            <p className="font-medium mb-1">Inspection Notes:</p>
                            <p className="text-muted-foreground">
                              {booking.inspection_notes}
                            </p>
                          </div>
                        )}

                        {(!booking.inspection_status ||
                          booking.inspection_status === "pending") && (
                          <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() =>
                                navigate(`/listing/${booking.listing_id}`)
                              }
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Property
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                handleInspectionUpdate(
                                  booking.id,
                                  "passed",
                                  "Property verified and approved."
                                )
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Pass
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() =>
                                handleInspectionUpdate(
                                  booking.id,
                                  "failed",
                                  "Property did not meet standards."
                                )
                              }
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Fail
                            </Button>
                          </div>
                        )}

                        {booking.inspection_status === "passed" && (
                          <div className="flex items-center gap-2 text-primary text-sm bg-primary/10 rounded-lg p-3">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              Inspection passed - Payment can be released to
                              landlord
                            </span>
                          </div>
                        )}

                        {booking.inspection_status === "failed" && (
                          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg p-3">
                            <XCircle className="w-4 h-4" />
                            <span>
                              Inspection failed - Refund will be processed to
                              student
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
