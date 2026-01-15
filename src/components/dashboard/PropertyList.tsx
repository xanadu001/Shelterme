import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  MapPin, 
  Bed, 
  Bath,
  Building2
} from "lucide-react";
import { toast } from "sonner";

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  university: string;
  price: number;
  period: string;
  bedrooms: number;
  bathrooms: number;
  size: string | null;
  amenities: string[];
  images: string[];
  is_verified: boolean;
  is_available: boolean;
  views_count: number;
  inquiries_count: number;
  created_at: string;
}

interface PropertyListProps {
  user: User | null;
  onEdit: (property: Property) => void;
}

const PropertyList = ({ user, onEdit }: PropertyListProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (property: Property) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ is_available: !property.is_available })
        .eq("id", property.id);

      if (error) throw error;
      
      setProperties(props => 
        props.map(p => p.id === property.id ? { ...p, is_available: !p.is_available } : p)
      );
      toast.success(property.is_available ? "Property hidden" : "Property visible");
    } catch (error: any) {
      toast.error("Failed to update property");
    }
  };

  const deleteProperty = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId);

      if (error) throw error;
      
      setProperties(props => props.filter(p => p.id !== propertyId));
      toast.success("Property deleted");
    } catch (error: any) {
      toast.error("Failed to delete property");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg" />
            <CardContent className="p-4 space-y-3">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
        <p className="text-muted-foreground mb-4">
          Start by adding your first property listing
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
          {/* Image */}
          <div className="relative h-48 bg-muted">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            {/* Status badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {property.is_verified && (
                <Badge className="bg-primary text-primary-foreground">Verified</Badge>
              )}
              {!property.is_available && (
                <Badge variant="secondary">Hidden</Badge>
              )}
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(property)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleAvailability(property)}>
                  {property.is_available ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Listing
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Listing
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => deleteProperty(property.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">{property.title}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{property.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {property.bedrooms}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {property.bathrooms}
              </span>
              {property.size && (
                <span>{property.size}</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(property.price)}
                </span>
                <span className="text-sm text-muted-foreground">/{property.period}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {property.views_count}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertyList;
