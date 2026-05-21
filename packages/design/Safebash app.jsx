// safebash-app.jsx — Standalone Trust-Bank prototype.
// Working nav, click-through from library to analyzer, accent tweak.

const { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakToggle } = window;
const { TBAnalyzer, TBLibrary } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#1d6b4f",
  "dark": false
}/*EDITMODE-END*/;

const ACCENTS_LIGHT = [
  "#1d6b4f", // sage
  "#1f4f8a", // navy
  "#a04a00", // amber
  "#8b3a62", // mulberry
  "#0b0c0e", // ink
];
// In dark mode the accents read better when they're a touch lighter & desaturated.
const ACCENTS_DARK = [
  "#6ec99a", // sage
  "#7aa3d4", // navy
  "#e5b96b", // amber
  "#d089ad", // mulberry
  "#ebe6db", // ink (now warm white)
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState("Library");

  // When toggling theme, snap accent to the equivalent slot in the other palette
  // so a user who picked "navy" doesn't end up with a value that looks wrong.
  const handleDark = (next) => {
    const from = next ? ACCENTS_LIGHT : ACCENTS_DARK;
    const to   = next ? ACCENTS_DARK  : ACCENTS_LIGHT;
    const i = from.indexOf(t.accent);
    const accent = i >= 0 ? to[i] : (next ? ACCENTS_DARK[0] : ACCENTS_LIGHT[0]);
    setTweak({ dark: next, accent });
  };

  React.useEffect(() => {
    document.documentElement.style.setProperty("--safebash-accent", t.accent);
    document.body.style.background = t.dark ? "#14130f" : "#f6f4ee";
  }, [t.accent, t.dark]);

  // Scroll to top whenever the route changes — feels like a real app.
  const scroller = React.useRef(null);
  React.useEffect(() => { if (scroller.current) scroller.current.scrollTop = 0; }, [route]);

  const goAnalyze = () => setRoute("Analyze");
  const accentPalette = t.dark ? ACCENTS_DARK : ACCENTS_LIGHT;

  return (
    <React.Fragment>
      <div ref={scroller} className={t.dark ? "sb-dark" : ""} style={{
        position:"absolute", inset:0, overflowY:"auto", overflowX:"auto",
        background: t.dark ? "#14130f" : "#f6f4ee",
      }}>
        <div style={{ minWidth: 1280 }}>
          {route === "Library" && <TBLibrary onNav={setRoute} onOpenScript={goAnalyze} dark={t.dark} />}
          {route === "Analyze" && <TBAnalyzer onNav={setRoute} dark={t.dark} />}
          {route !== "Analyze" && route !== "Library" && (
            <PlaceholderScreen route={route} onNav={setRoute} dark={t.dark} />
          )}
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={handleDark} />
        <TweakColor label="Accent color" value={t.accent} options={accentPalette}
                    onChange={(v) => setTweak("accent", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

// Soft fallback for nav tabs that don't have a dedicated screen yet.
function PlaceholderScreen({ route, onNav, dark }) {
  return (
    <div className={"tb" + (dark ? " dark" : "")} style={{ width:"100%", minHeight:"100vh" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"14px 28px", borderBottom:"1px solid var(--line)", background:"var(--paper)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:24, height:24, borderRadius:6, background:"var(--ink)",
                          display:"grid", placeItems:"center", color:"#fff" }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize:15, fontWeight:600 }}>
              SafeBash<span style={{ color:"var(--ink-3)", fontWeight:400 }}> · audit</span>
            </div>
          </div>
          <nav style={{ display:"flex", gap:4 }}>
            {["Library","Publish","Trusted","Community","API"].map(t => (
              <a key={t} onClick={(e) => { e.preventDefault(); onNav(t); }} style={{
                padding:"6px 12px", borderRadius:6, fontSize:13, textDecoration:"none",
                color: t === route ? "var(--ink)" : "var(--ink-3)",
                fontWeight: t === route ? 600 : 500,
                background: t === route ? "var(--line-2)" : "transparent",
                cursor:"pointer",
              }}>{t}</a>
            ))}
          </nav>
        </div>
      </div>
      <div style={{ padding:"60px 28px", display:"grid", placeItems:"center", height:"60vh" }}>
        <div className="card" style={{ padding:32, textAlign:"center", maxWidth:420 }}>
          <div style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>{route}</div>
          <div style={{ color:"var(--ink-3)", fontSize:13, marginBottom:18 }}>
            This area is wireframed in the directions canvas — not yet built into this prototype.
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
            <button className="btn" onClick={() => onNav("Library")}>← Back to Library</button>
            <button className="btn btn--ink" onClick={() => onNav("Analyze")}>Open sample script</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
