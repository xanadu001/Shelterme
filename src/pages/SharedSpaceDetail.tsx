import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share, MapPin, Grid3X3, Play, Zap, Wifi, Shield, Droplets, WashingMachine, Globe, Menu, User, Phone, Mail, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const amenityIcons: Record<string, React.ReactNode> = {
  "24/7 Power": <Zap className="w-5 h-5" />,
  "24/7 power": <Zap className="w-5 h-5" />,
  "Prepaid Meter": <Zap className="w-5 h-5" />,
  "WiFi Ready": <Wifi className="w-5 h-5" />,
  "WiFi": <Wifi className="w-5 h-5" />,
  "Security": <Shield className="w-5 h-5" />,
  "Borehole Water": <Droplets className="w-5 h-5" />,
  "Borehole": <Droplets className="w-5 h-5" />,
  "Water Supply": <Droplets className="w-5 h-5" />,
  "Laundry Area": <WashingMachine className="w-5 h-5" />,
};

interface SharedSpaceData {
  id: string;
  title: string;
  description: string;
  location: string;
  university: string;
  price: number;
  period: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  videos: string[];
  contact_phone: string | null;
  contact_email: string | null;
}

const SharedSpaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [loading, setLoading] = useState(true);
  const [space, setSpace] = useState<SharedSpaceData | null>(null);

  useEffect(() => {
    const fetchSpace = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("shared_spaces")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (data) {
        setSpace({
          id: data.id,
          title: data.title,
          description: data.description,
          location: data.location,
          university: data.university,
          price: Number(data.price),
          period: data.period,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          amenities: data.amenities || [],
          images: data.images && data.images.length > 0 ? data.images : ["/placeholder.svg"],
          videos: data.videos || [],
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
        });
      }
      setLoading(false);
    };
    fetchSpace();
  }, [id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lodge-accent"></div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">Shared space not found</h1>
          <Button onClick={() => navigate("/explore")}>Go back to explore</Button>
        </div>
      </div>
    );
  }

  const galleryImages = space.images.slice(0, 5);
  const displayedAmenities = showAllAmenities ? space.amenities : space.amenities.slice(0, 6);

  const handleWhatsApp = () => {
    if (space.contact_phone) {
      const phone = space.contact_phone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=Hi! I saw your shared space "${space.title}" on LodgeMe and I'm interested.`, "_blank");
    }
  };

  const handleCall = () => {
    if (space.contact_phone) {
      window.open(`tel:${space.contact_phone}`);
    }
  };

  const handleEmail = () => {
    if (space.contact_email) {
      window.open(`mailto:${space.contact_email}?subject=Interest in "${space.title}" on LodgeMe`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Top Nav */}
      <header className="hidden md:flex items-center justify-between px-6 lg:px-10 py-4 border-b border-border">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-lodge-accent cursor-pointer" onClick={() => navigate("/")}>LodgeMe</h1>
          <nav className="flex items-center gap-6 text-sm font-medium text-foreground">
            <button onClick={() => navigate("/explore")} className="hover:text-foreground/70 transition-colors">Explore</button>
            <button onClick={() => navigate("/wishlists")} className="hover:text-foreground/70 transition-colors">Saved</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Globe className="w-5 h-5 text-foreground" />
          <div onClick={() => navigate("/profile")} className="flex items-center gap-2 border border-border rounded-full px-3 py-1.5 hover:shadow-md transition-shadow cursor-pointer">
            <Menu className="w-4 h-4 text-foreground" />
            <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center">
              <User className="w-4 h-4 text-background" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Back Header */}
      <div className="md:hidden sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between z-10">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted">
            <Share className="w-5 h-5 text-foreground" />
          </button>
          <button onClick={() => setIsFavorite(!isFavorite)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted">
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-lodge-accent stroke-lodge-accent" : "text-foreground"}`} />
          </button>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 md:px-6 lg:px-10">
        {/* Title Section - Desktop */}
        <div className="hidden md:block pt-6 pb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] font-semibold text-foreground">{space.title}</h1>
            <span className="bg-lodge-accent/10 text-lodge-accent text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Shared by Student
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{space.location}</span>
            <span className="text-foreground">·</span>
            <span className="text-muted-foreground">{space.university}</span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="md:rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[280px] md:h-[400px]">
            <div className="md:col-span-2 md:row-span-2 relative cursor-pointer group" onClick={() => setShowAllPhotos(true)}>
              <img src={galleryImages[0]} alt={space.title} className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
            </div>
            {galleryImages.slice(1, 4).map((img, i) => (
              <div key={i} className="hidden md:block relative cursor-pointer group" onClick={() => setShowAllPhotos(true)}>
                <img src={img} alt="" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
              </div>
            ))}
            {galleryImages[4] ? (
              <div className="hidden md:block relative cursor-pointer group" onClick={() => setShowAllPhotos(true)}>
                <img src={galleryImages[4]} alt="" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                <button className="absolute bottom-4 right-4 bg-background text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md border border-border" onClick={(e) => { e.stopPropagation(); setShowAllPhotos(true); }}>
                  <Grid3X3 className="w-4 h-4" />
                  Show all photos
                </button>
              </div>
            ) : (
              <div className="hidden md:flex relative cursor-pointer group bg-muted items-center justify-center" onClick={() => setShowAllPhotos(true)}>
                <button className="bg-background text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md border border-border">
                  <Grid3X3 className="w-4 h-4" />
                  Show all photos
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Full Photos Modal */}
        {showAllPhotos && (
          <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
              <button onClick={() => setShowAllPhotos(false)} className="flex items-center gap-2 text-foreground hover:underline">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <span className="text-sm text-muted-foreground">
                {space.images.length} photos{space.videos.length > 0 ? `, ${space.videos.length} videos` : ''}
              </span>
            </div>
            <div className="p-4 space-y-4 max-w-4xl mx-auto">
              {space.videos.map((video, index) => (
                <div key={`video-${index}`} className="relative">
                  <video src={video} controls className="w-full rounded-lg" poster={space.images[0]} />
                  <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    Video {index + 1}
                  </div>
                </div>
              ))}
              {space.images.map((image, index) => (
                <img key={`image-${index}`} src={image} alt={`${space.title} - ${index + 1}`} className="w-full rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Title */}
        <div className="md:hidden pt-4 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold text-foreground">{space.title}</h1>
          </div>
          <span className="inline-flex items-center gap-1 bg-lodge-accent/10 text-lodge-accent text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
            <Users className="w-3 h-3" />
            Shared by Student
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-sm">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{space.location}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{space.university}</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 pt-6 pb-24 md:pb-12">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            {/* Room Info */}
            <div className="flex items-center justify-between pb-6 border-b border-border">
              <div>
                <h2 className="text-[22px] font-medium text-foreground">Shared student space</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {space.bedrooms} bedroom{space.bedrooms > 1 ? 's' : ''} · {space.bathrooms} bathroom{space.bathrooms > 1 ? 's' : ''}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-lodge-accent/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-lodge-accent" />
              </div>
            </div>

            {/* About */}
            <div className="py-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">About this space</h3>
              <p className="text-[15px] text-foreground/80 leading-relaxed">{space.description}</p>
            </div>

            {/* Amenities */}
            {space.amenities.length > 0 && (
              <div className="py-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {displayedAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-foreground/70">{amenityIcons[amenity] || <Zap className="w-5 h-5" />}</span>
                      <span className="text-[15px] text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
                {space.amenities.length > 6 && (
                  <button onClick={() => setShowAllAmenities(!showAllAmenities)} className="mt-4 text-lodge-accent font-medium text-sm hover:underline">
                    {showAllAmenities ? 'Show less' : `Show all ${space.amenities.length} amenities`}
                  </button>
                )}
              </div>
            )}

            {/* Contact Info Section */}
            <div className="py-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Contact the student</h3>
              <p className="text-sm text-muted-foreground mb-4">Reach out directly to the student sharing this space.</p>
              <div className="space-y-3">
                {space.contact_phone && (
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{space.contact_phone}</span>
                  </div>
                )}
                {space.contact_email && (
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{space.contact_email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Contact Card - Desktop */}
          <div className="hidden md:block w-[370px] flex-shrink-0">
            <div className="sticky top-8 border border-border rounded-xl shadow-lg p-6">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[22px] font-semibold text-foreground">{formatCurrency(space.price)}</span>
                <span className="text-muted-foreground">/ {space.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Contact the student directly to arrange viewing and sharing.</p>

              <div className="space-y-3">
                {space.contact_phone && (
                  <button onClick={handleWhatsApp} className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                )}
                {space.contact_phone && (
                  <button onClick={handleCall} className="w-full py-3 rounded-lg border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                )}
                {space.contact_email && (
                  <button onClick={handleEmail} className="w-full py-3 rounded-lg border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(space.price)}
              <span className="text-sm font-normal text-muted-foreground"> / {space.period}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {space.contact_phone && (
              <button onClick={handleWhatsApp} className="px-4 py-2.5 rounded-lg bg-green-600 text-white font-semibold text-sm flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            )}
            {space.contact_phone && (
              <button onClick={handleCall} className="px-4 py-2.5 rounded-lg border border-border text-foreground font-semibold text-sm">
                <Phone className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedSpaceDetail;
