export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1460px] mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
