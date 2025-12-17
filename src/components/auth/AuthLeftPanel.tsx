export default function AuthLeftPanel() {
  return (
    <div className="w-[420px] bg-[#00863F] rounded-[28px] text-white p-10 flex flex-col">
      <h2 className="text-[32px] font-bold leading-tight">
        <span className="text-[#FFCF32]">Rythuvaani -</span>
        <br />
        India’s Largest Telugu
        <br />
        Agri-Conversational
        <br />
        Speech Dataset
      </h2>

      <p className="mt-4 text-sm text-emerald-100 italic">
        “Building conversational voice technologies that truly understand
        farmers”
      </p>

      <div className="mt-8 w-full aspect-square rounded-2xl flex items-center justify-center bg-white/20">
        <span className="text-3xl">▶</span>
      </div>

      {/* <div className="mt-10">
        <h3 className="text-lg font-semibold text-[#FFCF32]">Why Us?</h3>
        <ul className="mt-4 space-y-3 text-sm text-emerald-100">
          <li>⭐ 30K hours agri audio</li>
          <li>⭐ All Telugu dialects</li>
          <li>⭐ 10M+ farmers impact</li>
        </ul>
      </div> */}
    </div>
  );
}
