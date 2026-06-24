"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase";
import Autocomplete from "@/components/ui/Autocomplete";
import { COUNTRIES, getCityOptions } from "@/lib/locations";
import { useTranslations } from "next-intl";

export default function AccountSettingsPage() {
  const t = useTranslations();
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
    if (error) setMessage(t("account.settings.saveError", { message: error.message }));
    else setMessage(t("account.settings.profileUpdated"));
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
      setMessage(t("account.settings.uploadError", { message: uploadError.message }));
      setSaving(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    setAvatarUrl(publicUrl);
    setMessage(t("account.settings.avatarUpdated"));
    setSaving(false);
  }

  async function handleChangeEmail() {
    if (!newEmail) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase!.auth.updateUser({ email: newEmail });
    if (error) setMessage(t("account.settings.saveError", { message: error.message }));
    else setMessage(t("account.settings.emailConfirmationSent"));
    setSaving(false);
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      setMessage(t("account.settings.passwordMinLength"));
      return;
    }
    setSaving(true);
    setMessage("");
    const { error } = await supabase!.auth.updateUser({ password: newPassword });
    if (error) setMessage(t("account.settings.saveError", { message: error.message }));
    else setMessage(t("account.settings.passwordUpdated"));
    setSaving(false);
    setNewPassword("");
    setCurrentPassword("");
    setShowPasswordForm(false);
  }

  if (loading) {
    return <div className="text-center py-12"><p className="text-text-secondary">{t("auth.loading")}</p></div>;
  }

  if (!supabase) {
    return <div className="text-center py-12"><p className="text-text-secondary">{t("account.settings.pleaseLogin")}</p></div>;
  }

  const inputClass = "w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelClass = "block text-sm font-medium text-text mb-1.5";
  const sectionClass = "bg-card border border-border rounded-2xl p-6 mb-6";

  return (
    <>
      <h1 className="text-2xl font-bold text-text mb-2">{t("account.settings.title")}</h1>
      <p className="text-text-secondary mb-8">{t("account.settings.desc")}</p>

      {message && (
        <div className={`mb-6 text-sm px-4 py-3 rounded-xl border ${message.startsWith(t("account.settings.errorPrefix")) ? "text-danger bg-danger/5 border-danger/20" : "text-success bg-success/5 border-success/20"}`}>
          {message}
        </div>
      )}

      {/* ──── Avatar + Member ID ──── */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-text mb-4">{t("account.settings.profile")}</h2>
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt={t("account.settings.avatarAlt")} className="w-16 h-16 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs hover:bg-primary-dark transition-colors"
              title={t("account.settings.changeAvatar")}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">{t("account.settings.memberId")}</p>
            <p className="text-lg font-mono font-bold text-text tracking-wider">{memberId}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t("account.settings.username")}</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className={inputClass} placeholder={t("account.settings.usernamePlaceholder")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("account.settings.country")}</label>
              <Autocomplete
                value={country}
                onChange={setCountry}
                placeholder={t("account.settings.countryPlaceholder")}
                options={COUNTRIES}
              />
            </div>
            <div>
              <label className={labelClass}>{t("account.settings.city")}</label>
              <Autocomplete
                value={city}
                onChange={setCity}
                placeholder={t("account.settings.cityPlaceholder")}
                options={getCityOptions(country)}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>{t("account.settings.occupation")}</label>
            <select value={occupation} onChange={(e) => setOccupation(e.target.value)}
              className={inputClass}>
              <option value="">{t("account.settings.occupationPlaceholder")}</option>
              <option value="Founder / CEO">{t("account.settings.occupations.founder")}</option>
              <option value="Operations Manager">{t("account.settings.occupations.opsManager")}</option>
              <option value="Supply Chain Director">{t("account.settings.occupations.supplyChain")}</option>
              <option value="E-commerce Manager">{t("account.settings.occupations.ecomManager")}</option>
              <option value="Logistics Coordinator">{t("account.settings.occupations.logisticsCoordinator")}</option>
              <option value="Warehouse Manager">{t("account.settings.occupations.warehouseManager")}</option>
              <option value="Business Owner">{t("account.settings.occupations.businessOwner")}</option>
              <option value="Consultant">{t("account.settings.occupations.consultant")}</option>
              <option value="Other">{t("account.settings.occupations.other")}</option>
            </select>
          </div>
        </div>

        <button onClick={handleSaveProfile} disabled={saving}
          className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-60">
          {saving ? t("account.settings.saving") : t("account.settings.saveProfile")}
        </button>
      </div>

      {/* ──── Email ──── */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-text mb-4">{t("account.settings.email")}</h2>
        <p className="text-sm text-text-secondary mb-4">{t("account.settings.currentEmail", { email })}</p>
        <div className="flex gap-3">
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
            className={`${inputClass} flex-1`} placeholder={t("account.settings.newEmail")} />
          <button onClick={handleChangeEmail} disabled={saving || !newEmail}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 shrink-0">
            {t("account.settings.changeEmail")}
          </button>
        </div>
      </div>

      {/* ──── Password ──── */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-text mb-4">{t("account.settings.password")}</h2>
        {!showPasswordForm ? (
          <button onClick={() => setShowPasswordForm(true)}
            className="px-4 py-2 border border-border rounded-xl text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors">
            {t("account.settings.changePassword")}
          </button>
        ) : (
          <div className="space-y-3">
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass} placeholder={t("account.settings.newPasswordPlaceholder")} />
            <div className="flex gap-3">
              <button onClick={handleChangePassword} disabled={saving || !newPassword}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-60">
                {t("account.settings.updatePassword")}
              </button>
              <button onClick={() => setShowPasswordForm(false)}
                className="px-6 py-2.5 border border-border rounded-xl text-sm text-text-secondary hover:text-text transition-colors">
                {t("account.settings.cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
