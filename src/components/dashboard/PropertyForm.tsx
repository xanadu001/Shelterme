import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Building2, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";


const AMENITIES_OPTIONS = [
  "24/7 Power",
  "Borehole Water",
  "Security",
  "WiFi Ready",
  "Tiled Floor",
  "POP Ceiling",
  "Wardrobe",
  "Kitchen",
  "AC",
  "Furnished",
  "Prepaid Meter",
  "CCTV",
  "Parking Space",
  "Laundry Area",
  "Reading Table",
  "Fan",
];

interface PropertyFormProps {
  user: User | null;
  property?: any;
  onClose: () => void;
}

const PropertyForm = ({ user, property, onClose }: PropertyFormProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [userUniversity, setUserUniversity] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    university: "",
    price: "",
    period: "year",
    bedrooms: "1",
    bathrooms: "1",
    size: "",
    amenities: [] as string[],
    images: [] as string[],
    videos: [] as string[],
  });

  // Fetch user's registered university from profile
  useEffect(() => {
    const fetchUserUniversity = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("university")
        .eq("id", user.id)
        .maybeSingle();
      
      if (data?.university) {
        setUserUniversity(data.university);
        setFormData(prev => ({ ...prev, university: data.university }));
      }
    };

    fetchUserUniversity();
  }, [user]);

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        location: property.location || "",
        university: property.university || userUniversity,
        price: property.price?.toString() || "",
        period: property.period || "year",
        bedrooms: property.bedrooms?.toString() || "1",
        bathrooms: property.bathrooms?.toString() || "1",
        size: property.size || "",
        amenities: property.amenities || [],
        images: property.images || [],
        videos: property.videos || [],
      });
    }
  }, [property, userUniversity]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("property-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      toast.success("Images uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setUploadingVideos(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Max size is 50MB`);
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("property-videos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("property-videos")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...uploadedUrls],
      }));
      toast.success("Videos uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload videos");
    } finally {
      setUploadingVideos(false);
    }
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const propertyData = {
        owner_id: user.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        university: formData.university,
        price: parseFloat(formData.price),
        period: formData.period,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        size: formData.size || null,
        amenities: formData.amenities,
        images: formData.images,
        videos: formData.videos,
      };

      if (property) {
        const { error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", property.id);
        if (error) throw error;
        toast.success("Property updated successfully");
      } else {
        const { error } = await supabase
          .from("properties")
          .insert(propertyData);
        if (error) throw error;
        toast.success("Property created successfully");
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{property ? "Edit Property" : "Add New Property"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Self-Contain near UNILAG Main Gate"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the property, its features, and nearby facilities..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g. Akoka, Lagos"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="university" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Area of Operation
              </Label>
              <Input
                id="university"
                value={userUniversity || "Not set"}
                disabled
                className="h-12 rounded-xl bg-muted"
              />
              <p className="text-xs text-muted-foreground">Based on your registered profile</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Rent Price (₦) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g. 350000"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Rent Period</Label>
              <Select
                value={formData.period}
                onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Per Month</SelectItem>
                  <SelectItem value="year">Per Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Room Type</Label>
              <Select
                value={formData.bedrooms}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bedrooms: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Single Room</SelectItem>
                  <SelectItem value="self-contain">Self-Contain</SelectItem>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedroom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Select
                value={formData.bathrooms}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bathrooms: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Bathroom" : "Bathrooms"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size (optional)</Label>
              <Input
                id="size"
                placeholder="e.g. 18 sqm"
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <Label>Property Images</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.images.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                ) : (
                  <>
                    <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Add Images</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Videos */}
          <div className="space-y-3">
            <Label>Property Videos (max 50MB each)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {formData.videos.map((url, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden group bg-muted">
                  <video src={url} className="w-full h-full object-cover" controls />
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={uploadingVideos}
                />
                {uploadingVideos ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                ) : (
                  <>
                    <Video className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Add Videos</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label>Amenities</Label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_OPTIONS.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    formData.amenities.includes(amenity)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : property ? "Update Property" : "Add Property"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertyForm;
