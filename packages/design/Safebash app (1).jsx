// app.jsx — Safebash canvas: 3 variants × 2 artboards. Accent color tweak.

const { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio } = window;
const { TBAnalyzer, TBLibrary, DTAnalyzer, DTLibrary, TVAnalyzer, TVLibrary } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#1d6b4f",
  "focus": "all"
}/*EDITMODE-END*/;

const ACCENTS = [
  "#1d6b4f", // sage / vault green
  "#1f4f8a", // bank navy
  "#a04a00", // amber
  "#8b3a62", // mulberry
  "#0b0c0e", // ink
  "#7ee0a1", // phosphor
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // Push accent into every variant via a single root custom property.
  React.useEffect(() => {
    document.documentElement.style.setProperty("--safebash-accent", t.accent);
  }, [t.accent]);

  const focus = t.focus || "all";
  const show = (key) => focus === "all" || focus === key;

  return (
    <React.Fragment>
      <DesignCanvas>
        {show("trustbank") && (
        <DCSection
          id="trust-bank"
          title="A · Trust-Bank"
          subtitle="Off-white, deep ink, sage. Information-dense. Audit-report feel.">
          <DCArtboard id="tb-analyzer" label="A.1 · Analyzer" width={1440} height={1880}>
            <TBAnalyzer />
          </DCArtboard>
          <DCArtboard id="tb-library" label="A.2 · Library" width={1440} height={1180}>
            <TBLibrary />
          </DCArtboard>
        </DCSection>
        )}

        {show("devtool") && (
        <DCSection
          id="devtool"
          title="B · Devtool Clean"
          subtitle="Linear/Vercel quiet. Spacious. Verdict as pill, score as a quiet number.">
          <DCArtboard id="dt-analyzer" label="B.1 · Analyzer" width={1440} height={1660}>
            <DTAnalyzer />
          </DCArtboard>
          <DCArtboard id="dt-library" label="B.2 · Library" width={1440} height={1180}>
            <DTLibrary />
          </DCArtboard>
        </DCSection>
        )}

        {show("terminal") && (
        <DCSection
          id="terminal"
          title="C · Terminal Vault"
          subtitle="Dark ops console. Mostly monospace, phosphor accents, ASCII trust meters.">
          <DCArtboard id="tv-analyzer" label="C.1 · Analyzer" width={1440} height={1620}>
            <TVAnalyzer />
          </DCArtboard>
          <DCArtboard id="tv-library" label="C.2 · Library" width={1440} height={1120}>
            <TVLibrary />
          </DCArtboard>
        </DCSection>
        )}
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="Accent" />
        <TweakColor label="Accent color" value={t.accent}
                    options={ACCENTS}
                    onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Focus" />
        <TweakRadio label="Variants" value={t.focus}
                    options={["all", "trustbank", "devtool", "terminal"]}
                    onChange={(v) => setTweak("focus", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
