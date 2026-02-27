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
  Ban,
  Bell,
  HelpCircle,
  GraduationCap,
  DollarSign,
  Menu,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

import AdminNotifications from "@/components/dashboard/AdminNotifications";
import AdminSettings from "@/components/dashboard/AdminSettings";

// --- Types (unchanged) ---
interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalLandlords: number;
  totalProperties: number;
  totalBookings: number;
  pendingVerifications: number;
  pendingInspections: number;
  monthlyRevenue: number;
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

// --- Sidebar Nav ---
const navItems = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "properties", label: "Properties", icon: Building2 },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "users", label: "Students", icon: GraduationCap },
  { id: "inspections", label: "Inspections", icon: ClipboardCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

const AdminSidebar = ({
  activeTab,
  onTabChange,
  user,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: User | null;
}) => {
  const getInitials = (email: string) => email?.substring(0, 2).toUpperCase() || "AD";

  return (
    <Sidebar className="border-r border-border bg-background" collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-foreground leading-tight">ShelterMe</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings button removed - now in nav */}

        {/* User */}
        <div className="px-5 py-4 border-t border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
            {getInitials(user?.email || "")}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">{user?.email?.split("@")[0] || "Admin"}</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

// --- Stat Card ---
const StatCard = ({
  title,
  value,
  icon: Icon,
  growth,
  iconBg,
}: {
  title: string;
  value: string | number;
  icon: any;
  growth?: string;
  iconBg: string;
}) => (
  <div className="bg-background border border-border rounded-xl p-5 flex items-start justify-between">
    <div className="flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      </div>
    </div>
    {growth && (
      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        {growth}
      </span>
    )}
  </div>
);

// --- Main Component ---
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
    monthlyRevenue: 0,
  });
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    // Get monthly revenue from service fees on verified bookings
    const { data: verifiedBookings } = await supabase
      .from("bookings")
      .select("service_fee")
      .eq("payment_status", "verified");
    
    const monthlyRevenue = verifiedBookings?.reduce((sum, b) => sum + Number(b.service_fee), 0) || 0;

    setStats({
      totalUsers: usersCount || 0,
      totalStudents: studentsCount || 0,
      totalLandlords: landlordsCount || 0,
      totalProperties: propertiesCount || 0,
      totalBookings: bookingsCount || 0,
      pendingVerifications: pendingCount || 0,
      pendingInspections: pendingInspectionsCount || 0,
      monthlyRevenue,
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
      const dbInspectionStatus = status === "passed" ? "approved" : status === "failed" ? "rejected" : status;

      const updateData: any = {
        inspection_status: dbInspectionStatus,
        inspection_date: new Date().toISOString(),
      };

      if (notes) {
        updateData.inspection_notes = notes;
      }

      if (status === "passed") {
        updateData.payment_status = "verified";
      }

      if (status === "failed") {
        updateData.payment_status = "rejected";
      }

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

      const listingId = updatedBooking.listing_id;
      if (listingId && listingId.length > 10) {
        if (status === "passed") {
          await supabase
            .from("properties")
            .update({ is_available: false })
            .eq("id", listingId);
        } else if (status === "failed") {
          await supabase
            .from("properties")
            .update({ is_available: true })
            .eq("id", listingId);
        }
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, ...updatedBooking } : b))
      );

      toast({
        title: status === "passed" ? "Inspection Passed" : "Inspection Failed",
        description:
          status === "passed"
            ? "Payment has been released to the landlord. Property is now marked as unavailable."
            : "The booking has been marked as failed. Property is now available for new bookings.",
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const getBookingDisplayStatus = (booking: BookingData) => {
    if (booking.inspection_status === "approved" || booking.payment_status === "verified") return "Confirmed";
    if (booking.inspection_status === "rejected" || booking.payment_status === "rejected") return "Rejected";
    if (booking.payment_status === "pending" || booking.payment_status === "submitted") return "Pending";
    return booking.payment_status || "Processing";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-primary/10 text-primary border-primary/20";
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  // Mock occupancy chart data
  const occupancyChartData = [
    { month: "Jan", value: 65 }, { month: "Feb", value: 70 }, { month: "Mar", value: 55 },
    { month: "Apr", value: 80 }, { month: "May", value: 75 }, { month: "Jun", value: 85 },
    { month: "Jul", value: 90 }, { month: "Aug", value: 88 }, { month: "Sep", value: 92 },
    { month: "Oct", value: 78 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery("");
    setFilterStatus("all");
    setMobileMenuOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} user={user} />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-background shadow-xl">
              <div className="p-4 flex justify-end">
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-1 px-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header */}
          <header className="bg-background border-b border-border px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden">
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>
              <h2 className="text-lg lg:text-xl font-semibold text-foreground">
                {navItems.find(n => n.id === activeTab)?.label || "Dashboard Overview"}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties, students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-muted/50 border-border"
                />
              </div>
              <AdminNotifications />
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Mobile search */}
          <div className="md:hidden px-4 pt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50"
              />
            </div>
          </div>

          {/* Content area */}
          <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-auto">
            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === "overview" && (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <StatCard
                    title="Total Properties"
                    value={stats.totalProperties}
                    icon={Building2}
                    growth="+5%"
                    iconBg="bg-primary"
                  />
                  <StatCard
                    title="Active Bookings"
                    value={stats.totalBookings}
                    icon={CalendarCheck}
                    growth="+12%"
                    iconBg="bg-blue-500"
                  />
                  <StatCard
                    title="Monthly Revenue"
                    value={formatCurrency(stats.monthlyRevenue)}
                    icon={DollarSign}
                    growth="+8%"
                    iconBg="bg-primary"
                  />
                </div>

                {/* Recent Bookings + Chart */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Recent Bookings Table */}
                  <div className="bg-background border border-border rounded-xl overflow-hidden">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-border">
                      <h3 className="font-semibold text-foreground">Recent Bookings</h3>
                      <button
                        onClick={() => handleTabChange("bookings")}
                        className="text-sm text-primary font-medium hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Property</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-in Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {bookings.slice(0, 5).map((booking) => {
                            const displayStatus = getBookingDisplayStatus(booking);
                            return (
                              <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                                      {booking.student_name?.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">{booking.student_name}</p>
                                      <p className="text-xs text-muted-foreground">ID: #{booking.id.substring(0, 4)}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-foreground">{booking.property?.title || "Property"}</p>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                  {format(new Date(booking.move_in_date), "MMM d, yyyy")}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(displayStatus)}`}>
                                    {displayStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {bookings.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                No bookings yet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* ===== USERS TAB ===== */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
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

                <div className="bg-background border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No users found</td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.id} className={`hover:bg-muted/30 transition-colors ${u.suspended ? "bg-destructive/5" : ""}`}>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                    {u.full_name?.split(" ").map(n => n[0]).join("").substring(0, 2) || "?"}
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{u.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize text-xs">
                                  {u.role}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground text-xs">{u.phone}</td>
                              <td className="px-6 py-4 text-muted-foreground text-xs">{format(new Date(u.created_at), "MMM d, yyyy")}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  {u.verified && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                  {u.suspended && <Badge variant="destructive" className="text-xs">Suspended</Badge>}
                                  {!u.verified && !u.suspended && <span className="text-xs text-muted-foreground">Unverified</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  {u.role !== "admin" && (
                                    <Button size="sm" variant={u.verified ? "outline" : "default"} className="h-7 text-xs" onClick={() => handleVerifyUser(u.id, !u.verified)}>
                                      {u.verified ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                    </Button>
                                  )}
                                  {(u.role === "landlord" || u.role === "agent") && (
                                    <Button size="sm" variant={u.suspended ? "outline" : "destructive"} className="h-7 text-xs" onClick={() => handleSuspendUser(u.id, !u.suspended)}>
                                      <Ban className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== PROPERTIES TAB ===== */}
            {activeTab === "properties" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {["all", "pending", "verified"].map((status) => (
                    <Button key={status} variant={filterStatus === status ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(status)} className="capitalize">
                      {status}
                    </Button>
                  ))}
                </div>

                <div className="bg-background border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Property</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredProperties.length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No properties found</td></tr>
                        ) : (
                          filteredProperties.map((property) => (
                            <tr key={property.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                    {property.images?.[0] ? (
                                      <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center"><Building2 className="w-4 h-4 text-muted-foreground" /></div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground line-clamp-1">{property.title}</p>
                                    <p className="text-xs text-muted-foreground">{property.bedrooms}bd • {property.bathrooms}ba</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground text-xs">{property.location}</td>
                              <td className="px-6 py-4 font-medium text-foreground">₦{property.price.toLocaleString()}/yr</td>
                              <td className="px-6 py-4">
                                <Badge variant={property.is_verified ? "default" : "secondary"}>
                                  {property.is_verified ? "Verified" : "Pending"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/listing/${property.id}`)}>
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  {!property.is_verified && (
                                    <>
                                      <Button size="sm" className="h-7 text-xs" onClick={() => handleVerifyProperty(property.id, true)}>
                                        <CheckCircle className="w-3 h-3" />
                                      </Button>
                                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleVerifyProperty(property.id, false)}>
                                        <XCircle className="w-3 h-3" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== BOOKINGS TAB ===== */}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {["all", "pending", "paid", "verified", "completed"].map((status) => (
                    <Button key={status} variant={filterStatus === status ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(status)} className="capitalize whitespace-nowrap">
                      {status}
                    </Button>
                  ))}
                </div>

                <div className="bg-background border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Property</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Move-in</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inspection</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredBookings.length === 0 ? (
                          <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No bookings found</td></tr>
                        ) : (
                          filteredBookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-foreground">{booking.student_name}</p>
                                  <p className="text-xs text-muted-foreground">{booking.student_email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">{booking.property?.title || "Property"}</td>
                              <td className="px-6 py-4 text-muted-foreground">{format(new Date(booking.move_in_date), "MMM d, yyyy")}</td>
                              <td className="px-6 py-4 font-medium text-foreground">₦{booking.total_amount.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <Badge variant={booking.payment_status === "verified" ? "default" : "secondary"}>
                                  {booking.payment_status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={booking.inspection_status === "approved" ? "default" : booking.inspection_status === "rejected" ? "destructive" : "secondary"}>
                                  {booking.inspection_status || "pending"}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== INSPECTIONS TAB ===== */}
            {activeTab === "inspections" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {["all", "pending", "passed", "failed"].map((status) => (
                    <Button key={status} variant={filterStatus === status ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(status)} className="capitalize">
                      {status}
                    </Button>
                  ))}
                </div>

                <div className="bg-background border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Property</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {bookings
                          .filter((b) =>
                            filterStatus === "all"
                              ? true
                              : b.inspection_status === filterStatus ||
                                (filterStatus === "pending" && (!b.inspection_status || b.inspection_status === "pending"))
                          )
                          .filter(
                            (b) =>
                              b.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              b.property?.title?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((booking) => (
                            <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-foreground">{booking.property?.title || "Property"}</p>
                                  <p className="text-xs text-muted-foreground">{booking.property?.location}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-foreground">{booking.student_name}</p>
                                  <p className="text-xs text-muted-foreground">{booking.student_phone}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-medium text-foreground">₦{booking.total_amount.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <Badge variant={booking.inspection_status === "approved" ? "default" : booking.inspection_status === "rejected" ? "destructive" : "secondary"}>
                                  {booking.inspection_status || "pending"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                {(!booking.inspection_status || booking.inspection_status === "pending") ? (
                                  <div className="flex items-center gap-1">
                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/listing/${booking.listing_id}`)}>
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" className="h-7 text-xs" onClick={() => handleInspectionUpdate(booking.id, "passed", "Property verified and approved.")}>
                                      <CheckCircle className="w-3 h-3 mr-1" /> Pass
                                    </Button>
                                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleInspectionUpdate(booking.id, "failed", "Property did not meet standards.")}>
                                      <XCircle className="w-3 h-3 mr-1" /> Fail
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">
                                    {booking.inspection_status === "approved" ? "✓ Passed" : "✗ Failed"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== SETTINGS TAB ===== */}
            {activeTab === "settings" && (
              <AdminSettings user={user} />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
