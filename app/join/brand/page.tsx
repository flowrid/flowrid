import BrandRegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Brand Registration | Flowrid",
};

export default function BrandJoinPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <BrandRegisterForm />
    </div>
  );
}
