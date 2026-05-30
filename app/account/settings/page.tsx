"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase";
import Autocomplete from "@/components/ui/Autocomplete";
import { COUNTRIES, searchCities } from "@/lib/locations";

export default function AccountSettingsPage() {
  const supabase = createBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [memberId, setMemberId] = useState("");

  // Profile
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");

  // Security
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      if (!user) { setLoading(false); return; }

      const meta = user.user_metadata || {};
      setEmail(user.email || "");
      setUsername((meta.username as string) || user.email?.split("@")[0] || "");
      setAvatarUrl((meta.avatar_url as string) || "");
      setCountry((meta.country as string) || "");
      setCity((meta.city as string) || "");
      setOccupation((meta.occupation as string) || "");

      // 生成或读取唯一会员ID
      let id = (meta.member_id as string) || "";
      if (!id) {
        id = generateMemberId(user.id);
        supabase.auth.updateUser({ data: { member_id: id } });
      }
      setMemberId(id);

      setLoading(false);
    });
  }, [supabase]);

  function generateMemberId(uuid: string): string {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
      hash = ((hash << 5) - hash) + uuid.charCodeAt(i);
      hash |= 0;
    }
    return String(Math.abs(hash) % 9000000000 + 1000000000).substring(0, 10);
  }

  async function handleSaveProfile() {
    setSaving(true);
    setMessage("");
    const { error } = await supabase!.auth.updateUser({
      data: { username, country, city, occupation, member_id: memberId },
    });
    if (error) setMessage("Error: " + error.message);
    else setMessage("Profile updated.");
    setSaving(false);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    setSaving(true);
    setMessage("");

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) { setSaving(false); return; }

    const filePath = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage("Upload failed: " + uploadError.message);
      setSaving(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    setAvatarUrl(publicUrl);
    setMessage("Avatar updated.");
    setSaving(false);
  }

  async function handleChangeEmail() {
    if (!newEmail) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase!.auth.updateUser({ email: newEmail });
    if (error) setMessage("Error: " + error.message);
    else setMessage("Confirmation emails sent to both old and new addresses.");
    setSaving(false);
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    setMessage("");
    const { error } = await supabase!.auth.updateUser({ password: newPassword });
    if (error) setMessage("Error: " + error.message);
    else setMessage("Password updated.");
    setSaving(false);
    setNewPassword("");
    setCurrentPassword("");
    setShowPasswordForm(false);
  }

  if (loading) {
    return <div className="text-center py-12"><p className="text-text-secondary">Loading...</p></div>;
  }

  if (!supabase) {
    return <div className="text-center py-12"><p className="text-text-secondary">Please log in.</p></div>;
  }

  const inputClass = "w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelClass = "block text-sm font-medium text-text mb-1.5";
  const sectionClass = "bg-card border border-border rounded-2xl p-6 mb-6";

  return (
    <>
      <h1 className="text-2xl font-bold text-text mb-2">Account Settings</h1>
      <p className="text-text-secondary mb-8">Manage your profile, security, and preferences.</p>

      {message && (
        <div className={`mb-6 text-sm px-4 py-3 rounded-xl border ${message.startsWith("Error") ? "text-danger bg-danger/5 border-danger/20" : "text-success bg-success/5 border-success/20"}`}>
          {message}
        </div>
      )}

      {/* ──── Avatar + Member ID ──── */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-text mb-4">Profile</h2>
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs hover:bg-primary-dark transition-colors"
              title="Change avatar"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Member ID</p>
            <p className="text-lg font-mono font-bold text-text tracking-wider">{memberId}</p>
            <p className="text-xs text-text-secondary mt-0.5">Unique identifier — cannot be changed</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className={inputClass} placeholder="Your display name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Country / Region</label>
              <Autocomplete
                value={country}
                onChange={setCountry}
                placeholder="Start typing..."
                options={COUNTRIES}
              />
              <p className="text-xs text-text-secondary mt-1">Optional — select from list</p>
            </div>
            <div>
              <label className={labelClass}>City</label>
              <Autocomplete
                value={city}
                onChange={setCity}
                placeholder="Start typing your city..."
                fetchOptions={searchCities}
              />
              <p className="text-xs text-text-secondary mt-1">Optional — US cities prioritized</p>
            </div>
          </div>
          <div>
            <label className={labelClass}>Occupation / Role</label>
            <select value={occupation} onChange={(e) => setOccupation(e.target.value)}
              className={inputClass}>
              <option value="">Select (optional)</option>
              <option value="Founder / CEO">Founder / CEO</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Supply Chain Director">Supply Chain Director</option>
              <option value="E-commerce Manager">E-commerce Manager</option>
              <option value="Logistics Coordinator">Logistics Coordinator</option>
              <option value="Warehouse Manager">Warehouse Manager</option>
              <option value="Business Owner">Business Owner</option>
              <option value="Consultant">Consultant</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <button onClick={handleSaveProfile} disabled={saving}
          className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-60">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* ──── Email ──── */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-text mb-4">Email</h2>
        <p className="text-sm text-text-secondary mb-4">Current email: <span className="text-text font-medium">{email}</span></p>
        <div className="flex gap-3">
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
            className={`${inputClass} flex-1`} placeholder="New email address" />
          <button onClick={handleChangeEmail} disabled={saving || !newEmail}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 shrink-0">
            Change Email
          </button>
        </div>
      </div>

      {/* ──── Password ──── */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-text mb-4">Password</h2>
        {!showPasswordForm ? (
          <button onClick={() => setShowPasswordForm(true)}
            className="px-4 py-2 border border-border rounded-xl text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors">
            Change Password
          </button>
        ) : (
          <div className="space-y-3">
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass} placeholder="New password (min 6 characters)" />
            <div className="flex gap-3">
              <button onClick={handleChangePassword} disabled={saving || !newPassword}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-60">
                Update Password
              </button>
              <button onClick={() => setShowPasswordForm(false)}
                className="px-6 py-2.5 border border-border rounded-xl text-sm text-text-secondary hover:text-text transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
