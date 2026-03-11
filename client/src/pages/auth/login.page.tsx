import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <SignIn routing="path" path="/auth/login" signUpUrl="/auth?tab=register" />
    </div>
  );
}