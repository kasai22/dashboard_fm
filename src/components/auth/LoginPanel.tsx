import GoogleSignInBtn from "@/components/GoogleSignInBtn";

export function LoginPanel() {
  return (
    <div className="bg-slate-50 border rounded-2xl p-6">
      <ol className="space-y-3 align-left text-sm text-slate-700">
        <li> Vertification of audio and text pairs</li>
        <li> Enabling voice agents for small holder telugu farmers</li>
      </ol>

      <div className="mt-6">
        <GoogleSignInBtn />
      </div>
    </div>
  );
}
