import GoogleSignInBtn from "@/components/GoogleSignInBtn";

export function LoginPanel() {
  return (
    <div className="bg-slate-50 border rounded-2xl p-6">
      <ul className="space-y-3 align-left text-sm text-slate-700">
        <li>⭐ Review audio accuracy</li>
        <li>⭐ Track verification</li>
        <li>⭐ Build Telugu dataset</li>
      </ul>

      <div className="mt-6">
        <GoogleSignInBtn />
      </div>
    </div>
  );
}
