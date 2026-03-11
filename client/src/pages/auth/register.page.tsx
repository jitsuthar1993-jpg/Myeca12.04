import { SignUp } from "@clerk/clerk-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <SignUp routing="path" path="/auth/register" signInUrl="/auth/login" />
    </div>
  );
}