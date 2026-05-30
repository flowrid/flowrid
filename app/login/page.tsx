import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Log in | Flowrid",
  description: "Log in to your Flowrid account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <LoginForm />
    </div>
  );
}
