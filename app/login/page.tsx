import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("@/components/auth/LoginForm"), {
  ssr: false,
  loading: () => (
    <div className="text-center py-12">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-text-secondary text-sm">Loading...</p>
    </div>
  ),
});

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
