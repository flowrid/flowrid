import BrandRegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "3PL Partner Registration | Flowrid",
};

export default function ThreePLJoinPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <BrandRegisterForm />
    </div>
  );
}
