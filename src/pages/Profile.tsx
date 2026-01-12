import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Music,
  Clock,
  Settings,
  Edit2,
  Loader2,
  LogOut,
  Shield,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocalMusic } from "@/hooks/useLocalMusic";

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  className?: string;
  delay?: number;
}> = ({ icon, label, value, sublabel, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.02, translateY: -2 }}
    className={cn(
      "glass-card p-6 relative overflow-hidden group",
      className
    )}
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity scale-150">
      {icon}
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-white/5 text-primary backdrop-blur-md shadow-sm border border-white/10">
          {icon}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <div>
        <p className="text-3xl font-display font-bold tracking-tight text-foreground">{value}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">{sublabel}</p>
        )}
      </div>
    </div>
  </motion.div>
);

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [updating, setUpdating] = useState(false);

  // Real data hooks
  const { history, downloadedSongs } = useLocalMusic();

  // Computed stats
  const uniqueArtists = new Set(history.map(s => s.artist)).size;
  const totalPlays = history.length;
  const librarySize = downloadedSongs.length;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setNewName(session.user.user_metadata?.display_name || "");
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      // 1. Update Auth Metadata (User Session)
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: newName }
      });
      if (authError) throw authError;

      // 2. Update Public Profiles Table (Database Persistence)
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ display_name: newName, updated_at: new Date().toISOString() })
        .eq('id', user.id); // Assuming 'id' in profiles matches auth.user.id

      if (dbError) {
        console.error("Failed to sync profile to DB:", dbError);
        // Don't throw here, as auth update succeeded
      }

      toast.success("Profile updated!");
      setIsEditing(false);
      // Refresh local user state
      const { data: { session } } = await supabase.auth.refreshSession();
      if (session) setUser(session.user);
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/10 via-background/50 to-background" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] opacity-20 animate-blob animation-delay-2000" />
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 relative z-10 pb-32">
        {/* Navbar */}
        <div className="flex items-center justify-between mb-12">
          <Button variant="ghost" className="group gap-2 hover:bg-white/5" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive transition-colors" title="Logout" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col md:flex-row items-center gap-8 mb-16"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary via-accent to-secondary rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000"></div>
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl relative">
              <AvatarImage src={user?.user_metadata?.avatar_url} className="object-cover" />
              <AvatarFallback className="text-4xl bg-muted text-muted-foreground font-display font-bold">
                {user?.user_metadata?.display_name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="icon" className="absolute bottom-1 right-1 h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-transform z-20">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                      placeholder="Enter your name"
                    />
                  </div>
                  <Button onClick={handleUpdateProfile} disabled={updating} variant="glow" className="w-full">
                    {updating ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Changes"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="text-center md:text-left space-y-2 flex-1">
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/60">
              {user?.user_metadata?.display_name || "Music Enthusiast"}
            </h1>
            <p className="text-lg text-muted-foreground font-light">{user?.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Premium Member
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground">
                Joined {new Date(user?.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            icon={<Music className="w-5 h-5" />}
            label="Songs Played"
            value={totalPlays}
            sublabel="Lifetime history"
            delay={0.1}
          />
          <StatCard
            icon={<Download className="w-5 h-5" />}
            label="Library Size"
            value={librarySize}
            sublabel="Downloaded tracks"
            delay={0.2}
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Artists Discovered"
            value={uniqueArtists}
            sublabel="Unique artists"
            delay={0.3}
          />
        </div>

        {/* Action Banner */}
        {librarySize === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-8 rounded-3xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-50" />
            <h3 className="text-2xl font-bold mb-2 relative z-10">Start Your Collection</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto relative z-10">
              Your library is looking a bit empty. Explore trending music or import your favorites to get started.
            </p>
            <Link to="/">
              <Button variant="glow" size="lg" className="relative z-10">
                Explore Music
              </Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Profile;
