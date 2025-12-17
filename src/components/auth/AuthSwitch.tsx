export function AuthSwitch({
  active,
  setActive,
}: {
  active: "login" | "register";
  setActive: (v: "login" | "register") => void;
}) {
  return (
    <div className="mt-8 w-full bg-[#00863F] rounded-full p-1 flex">
      {["login", "register"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab as any)}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
            active === tab ? "bg-white text-[#00863F]" : "text-white"
          }`}
        >
          {tab === "login" ? "Login" : "Register"}
        </button>
      ))}
    </div>
  );
}
