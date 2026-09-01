// TODO: Zavatar Studio is under active development.
// This page is temporarily disabled to unblock the Netlify build.
// It will be re-enabled once the zavatar sub-app (including the sharp-based
// TemplateAdapter and native linux-x64 binaries) is production-ready.

export default function ZavatarStudioPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white px-6">
      <div className="max-w-md text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-2">
          <span className="text-3xl">🧬</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Zavatar Studio</h1>
        <p className="text-white/50 text-sm leading-relaxed">
          We&apos;re putting the finishing touches on Zavatar — your AI-powered digital avatar.
          It&apos;ll be ready soon.
        </p>
        <p className="text-[11px] font-semibold tracking-widest text-cyan-500/60 uppercase">
          Coming Soon
        </p>
      </div>
    </main>
  );
}
