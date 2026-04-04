import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Camera, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ShareSpacePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    university: "",
    price: "",
    period: "month",
    bedrooms: "1",
    bathrooms: "1",
    contactPhone: "",
    contactEmail: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth?role=student&redirect=share-space");
        return;
      }
      setUserId(user.id);
      setForm(prev => ({ ...prev, contactEmail: user.email || "" }));
    };
    checkAuth();
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast({ title: "Some files were too large (max 10MB)", variant: "destructive" });
    }
    setImages(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.size <= 50 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast({ title: "Some files were too large (max 50MB)", variant: "destructive" });
    }
    setVideos(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setVideoPreviews(prev => [...prev, url]);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!form.title || !form.description || !form.location || !form.university || !form.price) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (images.length === 0) {
      toast({ title: "Please upload at least one photo", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of images) {
        const ext = file.name.split('.').pop();
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("shared-space-media").upload(path, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("shared-space-media").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      // Upload videos
      const videoUrls: string[] = [];
      for (const file of videos) {
        const ext = file.name.split('.').pop();
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("shared-space-media").upload(path, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("shared-space-media").getPublicUrl(path);
        videoUrls.push(urlData.publicUrl);
      }

      // Insert shared space
      const { error: insertError } = await supabase.from("shared_spaces").insert({
        owner_id: userId,
        title: form.title,
        description: form.description,
        location: form.location,
        university: form.university,
        price: parseFloat(form.price),
        period: form.period,
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        images: imageUrls,
        videos: videoUrls,
        contact_phone: form.contactPhone || null,
        contact_email: form.contactEmail || null,
      });

      if (insertError) throw insertError;

      toast({ title: "Space shared successfully! 🎉" });
      navigate("/explore");
    } catch (error: any) {
      console.error("Error sharing space:", error);
      toast({ title: "Failed to share space", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Share Your Space</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5 pb-24">
        {/* Photo Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Photos *</Label>
          <div className="flex gap-2 flex-wrap">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <Camera className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground mt-0.5">Add</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Video Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Videos (optional)</Label>
          <div className="flex gap-2 flex-wrap">
            {videoPreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                <video src={src} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeVideo(i)}
                  className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <Video className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground mt-0.5">Add</span>
              <input type="file" accept="video/*" multiple onChange={handleVideoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
          <Input
            id="title"
            placeholder="e.g. Spacious room near FUT Minna"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="desc" className="text-sm font-medium">Description *</Label>
          <Textarea
            id="desc"
            placeholder="Describe your room, what's included, house rules..."
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={4}
            maxLength={1000}
          />
        </div>

        {/* Location & University */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
            <Input
              id="location"
              placeholder="e.g. Bosso"
              value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="university" className="text-sm font-medium">University *</Label>
            <Input
              id="university"
              placeholder="e.g. FUT Minna"
              value={form.university}
              onChange={e => setForm(p => ({ ...p, university: e.target.value }))}
            />
          </div>
        </div>

        {/* Price & Period */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-sm font-medium">Price (₦) *</Label>
            <Input
              id="price"
              type="number"
              placeholder="e.g. 50000"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              min={0}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Period</Label>
            <Select value={form.period} onValueChange={v => setForm(p => ({ ...p, period: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Per Month</SelectItem>
                <SelectItem value="year">Per Year</SelectItem>
                <SelectItem value="semester">Per Semester</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Bedrooms</Label>
            <Select value={form.bedrooms} onValueChange={v => setForm(p => ({ ...p, bedrooms: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Bathrooms</Label>
            <Select value={form.bathrooms} onValueChange={v => setForm(p => ({ ...p, bathrooms: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1,2,3,4].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
            <Input
              id="phone"
              placeholder="080..."
              value={form.contactPhone}
              onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.contactEmail}
              onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-semibold rounded-xl bg-lodge-accent text-lodge-accent-foreground hover:bg-lodge-accent/90"
        >
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Sharing...</span>
          ) : (
            <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Share Space</span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ShareSpacePage;
