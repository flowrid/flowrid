import AccountSidebar from "@/components/AccountSidebar";
import NotificationBell from "@/components/saas/NotificationBell";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F5F5F7]">
      <AccountSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden pb-20 md:pb-0">
        {/* Top bar with notification bell */}
        <div className="flex items-center justify-end px-4 md:px-8 pt-4">
          <NotificationBell apiPrefix="account" />
        </div>
        <div className="mx-auto max-w-[1280px] px-4 md:px-8 pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
