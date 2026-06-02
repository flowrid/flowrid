import AccountSidebar from "@/components/AccountSidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F5F5F7]">
      <AccountSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden pb-20 md:pb-0">
        <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
