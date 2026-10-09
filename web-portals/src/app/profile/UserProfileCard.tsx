"use client";

import { useState, useRef } from "react";
import { 
  Pencil, 
  Camera, 
  Check, 
  X, 
  Headphones, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  LayoutGrid, 
  ShoppingBag, 
  Truck, 
  Warehouse, 
  Store, 
  Loader2, 
  Phone, 
  Mail, 
  AlertCircle
} from "lucide-react";
import { useUserProfile } from "./useUserProfile";
import { UserRole, UserActivity } from "./types";
import { getRoleConfig } from "./roleConfig";
import { formatActivityTime } from "./activityLogger";

export default function UserProfileCard() {
  const { profile, loading, uploadAvatar, updateProfile, logout, refetch } = useUserProfile();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit modal form inputs (100% dynamic to database columns)
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [formOutlet, setFormOutlet] = useState("");
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formAssignedMeta, setFormAssignedMeta] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [supportMessage, setSupportMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const role = profile?.role || "loader";
  const roleConfig = getRoleConfig(role);

  // Copy the saved profile into the form each time the edit dialog opens
  const openEditModal = () => {
    if (profile) {
      setFormName(profile.fullName || "");
      setFormPhone(profile.phone || "");
      setFormDepartment(profile.department || roleConfig.defaultDepartment);
      setFormOutlet(profile.outlet || profile.assignedBay || "");
      setFormEmployeeId(profile.employeeId || "");
      setFormAssignedMeta(profile.assignedMeta || "");
    }
    setIsEditModalOpen(true);
  };

  // Dynamic values loaded directly from database and roleConfig
  const roleTitle = profile?.roleTitle || roleConfig.title;
  const RoleIcon = roleConfig.icon;
  const badgeStyle = roleConfig.badgeStyle;

  const displayName = profile?.fullName || "Staff Member";
  const displayEmail = profile?.email || "";
  const displayPhone = profile?.phone || "Not configured";
  const displayDepartment = profile?.department || roleConfig.defaultDepartment;
  const displayEmployeeId = profile?.employeeId || "Not assigned";
  const displayLocation = roleConfig.getLocationDisplay(profile);
  const displayAssignedMeta = roleConfig.getMetaDisplay(profile);
  const assignedLabel = roleConfig.assignedLabel;
  const isVerified = profile?.isVerified ?? false;
  const status = profile?.status || "Unknown";
  const avatarUrl = profile?.avatarUrl;
  const initials = profile?.initials || "WP";

  const activities: UserActivity[] = profile?.activities && profile.activities.length > 0
    ? profile.activities
    : [
        { title: "Account active", meta: "Session authenticated", time: "Just now", type: "check" }
      ];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      setUploadError(null);
      await uploadAvatar(file);
      await refetch();
    } catch (err) {
      setUploadError(err instanceof Error && err.message ? err.message : "Failed to upload avatar photo");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setUploadError(null);
      await updateProfile({
        fullName: formName,
        phone: formPhone,
        department: formDepartment,
        outlet: formOutlet,
        assignedBay: (roleConfig.role === "loader" || roleConfig.role === "driver") ? formOutlet : undefined,
        assignedMeta: formAssignedMeta,
      });
      await refetch();
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditModalOpen(false);
      }, 1000);
    } catch (err) {
      setUploadError(err instanceof Error && err.message ? err.message : "Failed to save profile changes to database");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="w-full min-h-[420px] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-[#E8E8E3] shadow-xs">
        <Loader2 className="w-8 h-8 text-waypoint-orange animate-spin mb-3" />
        <p className="text-sm font-bold text-gray-700">Loading user profile from database...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

      {/* Top Title & Role Indicator */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Identity, access, and account support
          </p>
        </div>

        {/* Dynamic Database Role Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200/90 rounded-full shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-gray-700 capitalize">{roleTitle}</span>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E8E3] p-6 sm:p-7 shadow-xs relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
            {/* Avatar with Ring & Status Badge */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white ring-4 ring-sky-100 shadow-xs bg-slate-900 flex items-center justify-center text-white font-bold text-xl relative">
                  {isUploadingPhoto ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-waypoint-yellow animate-spin" />
                    </div>
                  ) : avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={displayName} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                {/* Camera upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload avatar photo to Supabase Storage"
                  className="absolute bottom-0 right-0 p-1.5 bg-[#FFC83D] text-gray-900 rounded-full shadow-xs hover:bg-[#F5B82A] transition-transform active:scale-95 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Status Badge from Database */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-gray-200/90 rounded-full shadow-2xs mt-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-gray-700 capitalize">{status}</span>
              </div>
            </div>

            {/* Profile Identity Details */}
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {displayName}
                </h2>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border tracking-wide uppercase ${badgeStyle}`}>
                  {roleTitle}
                </span>
              </div>

              <p className="text-xs text-gray-500 font-medium mt-1">
                {displayEmployeeId} • {displayDepartment} • {displayLocation}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="self-center sm:self-start">
            <button
              type="button"
              onClick={openEditModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200/90 rounded-xl text-xs font-bold text-gray-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-gray-500" />
              <span>Edit profile</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Column (Details + Activity) & Right Column (Access + Help + Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Profile details */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E8E3] p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Profile details
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Verified database record from Supabase
                </p>
              </div>

              {isVerified && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Verified
                </span>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    User ID
                  </span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {displayEmployeeId}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Department
                  </span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {displayDepartment}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Email
                  </span>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                    {displayEmail}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Phone
                  </span>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {displayPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Assigned Scope Box (100% Dynamic from Database) */}
            <div className="bg-[#FAF9F5] border border-[#ECECE6] rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 bg-[#FFF5D0] text-[#D97706] rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
                <RoleIcon className="w-5 h-5" />
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {assignedLabel}
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {displayLocation}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {displayAssignedMeta}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Recent activity (Dynamic from Database) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E8E3] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Recent activity
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Latest account actions recorded in database
                </p>
              </div>

              <span className="text-xs font-bold text-gray-400">
                Live Feed
              </span>
            </div>

            {activities.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {activities.map((item, idx) => {
                  const IconComponent = 
                    item.type === "check" ? Check : item.type === "bag" ? ShoppingBag : Truck;
                  return (
                    <div key={idx} className="py-3.5 first:pt-2 last:pb-1 flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-[#FFF9E6] text-[#F59E0B] flex items-center justify-center shrink-0">
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {item.meta}
                        </p>
                      </div>

                      <span className="text-[11px] text-gray-400 font-medium shrink-0">
                        {formatActivityTime(item.time)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400 font-medium">
                No shift activities recorded yet. Actions will appear here in real-time.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Need help? */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E8E3] p-6 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFF6D8] text-amber-600 flex items-center justify-center shadow-2xs">
              <Headphones className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Need help?
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Contact your administrator for access, account, or operational support.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                window.open("mailto:support@waypoint.com?subject=Waypoint%20Account%20Support", "_blank");
              }}
              className="w-full py-2.5 px-4 bg-[#FFC83D] hover:bg-[#F5B82A] text-gray-900 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Contact admin</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {supportMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs font-medium animate-in fade-in">
              {supportMessage}
            </div>
          )}

          {/* Card 3: Action Links (Settings, Help, Logout) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E8E3] p-4 shadow-xs divide-y divide-gray-100">
            <button
              type="button"
              onClick={openEditModal}
              className="w-full flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-gray-400" />
                <span>Account settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                setSupportMessage("Waypoint internal documentation and support: support@waypoint.com");
                setTimeout(() => setSupportMessage(null), 4000);
              }}
              className="w-full flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-gray-400" />
                <span>Help center</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-between py-2.5 px-3 hover:bg-red-50 rounded-xl text-xs font-semibold text-[#E05252] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-[#E05252]" />
                <span>Log out</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#E05252]" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Interactive Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-waypoint-orange" />
                <h3 className="text-base font-bold text-gray-900">
                  Edit Account Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo inside modal */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-900 text-white font-bold flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900">Profile Photo</p>
                  <p className="text-[11px] text-gray-500">Stored in Supabase Storage</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 shadow-2xs cursor-pointer"
                >
                  Upload
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-waypoint-yellow/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formEmployeeId}
                    readOnly
                    title="Employee ID is managed by dispatch"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+94 7X XXX XXXX"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-waypoint-yellow/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-waypoint-yellow/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  {roleConfig.assignedLabel}
                </label>
                <input
                  type="text"
                  value={formOutlet}
                  onChange={(e) => setFormOutlet(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-waypoint-yellow/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Location / Shift Schedule Notes
                </label>
                <input
                  type="text"
                  value={formAssignedMeta}
                  onChange={(e) => setFormAssignedMeta(e.target.value)}
                  placeholder="e.g. Store hours : 6:00-18:00 or Morning Shift"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-waypoint-yellow/50"
                />
              </div>

              {saveSuccess && (
                <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated in Supabase database!</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-waypoint-yellow hover:bg-amber-400 text-gray-900 text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
