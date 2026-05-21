// variant-terminal.jsx — "Dark ops console." Mostly mono. Phosphor accents.

const { Icon, SAMPLE_URL, SAMPLE_BASH, SIGNALS, ACTIONS, NETWORK,
        FILES_TOUCHED, DIFF_LINES, COMMUNITY, LIBRARY } = window;

const TV_TOKENS = `
  .tv { --bg:#0c0d10; --panel:#15171c; --panel-2:#1a1d23;
        --line:#252830; --line-2:#1f2228;
        --ink:#e8ecf2; --ink-2:#a4adbb; --ink-3:#6b7281; --ink-4:#454b56;
        --good:#7ee0a1; --good-bg:rgba(126,224,161,.10); --good-line:rgba(126,224,161,.25);
        --warn:#f1c97a; --warn-bg:rgba(241,201,122,.09); --warn-line:rgba(241,201,122,.25);
        --bad:#f08680;  --bad-bg:rgba(240,134,128,.08);  --bad-line:rgba(240,134,128,.25);
        --accent: var(--safebash-accent, #7ee0a1);
        background:var(--bg); color:var(--ink);
        font-family:'JetBrains Mono','IBM Plex Mono',ui-monospace,monospace;
        -webkit-font-smoothing:antialiased; font-feature-settings:"ss01"; }
  .tv .ui { font-family:'Inter','Inter Tight',-apple-system,system-ui,sans-serif; }
  .tv .panel { background:var(--panel); border:1px solid var(--line); border-radius:6px; }
  .tv .cap { font-size:10.5px; letter-spacing:.18em; text-transform:uppercase;
             color:var(--ink-3); }
  .tv .pill { display:inline-flex; align-items:center; gap:6px;
              padding:2px 8px; border-radius:4px; font-size:10.5px;
              background:var(--panel-2); color:var(--ink-2);
              border:1px solid var(--line); letter-spacing:.04em; }
  .tv .pill--good { background:var(--good-bg); color:var(--good); border-color:var(--good-line); }
  .tv .pill--warn { background:var(--warn-bg); color:var(--warn); border-color:var(--warn-line); }
  .tv .pill--bad  { background:var(--bad-bg);  color:var(--bad);  border-color:var(--bad-line);  }
  .tv .btn { display:inline-flex; align-items:center; gap:6px; padding:6px 11px;
             border-radius:5px; border:1px solid var(--line); background:var(--panel-2);
             color:var(--ink); font-size:11.5px; font-family:'JetBrains Mono', ui-monospace, monospace;
             cursor:pointer; letter-spacing:.02em; }
  .tv .btn:hover { border-color:var(--ink-3); }
  .tv .btn--accent { background:var(--accent); color:#0a1810; border-color:var(--accent); font-weight:600; }
  .tv .dot { width:6px; height:6px; border-radius:50%; background:currentColor; }
  .tv .glow { box-shadow: 0 0 0 1px var(--good-line), 0 0 24px -8px var(--accent); }
`;

if (typeof document !== "undefined" && !document.getElementById("tv-tokens")) {
  const s = document.createElement("style"); s.id = "tv-tokens";
  s.textContent = TV_TOKENS; document.head.appendChild(s);
}

// ── Header ─────────────────────────────────────────────────────────────────

function TVHeader({ active="audit" }) {
  const cmds = [
    { k:"audit",     d:"~/scripts" },
    { k:"library",   d:"./" },
    { k:"trusted",   d:"./registry" },
    { k:"community", d:"./peers" },
    { k:"keys",      d:"~/.safebash" },
  ];
  return (
    <header style={{ borderBottom:"1px solid var(--line)",
                     background:"linear-gradient(180deg, #101216 0%, #0c0d10 100%)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"12px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:22, height:22, border:"1px solid var(--good-line)", borderRadius:5,
                          background:"var(--good-bg)", display:"grid", placeItems:"center", color:"var(--good)" }}>
              <Icon name="shield" size={11} stroke={2.2}/>
            </div>
            <span style={{ fontSize:13.5, fontWeight:600, letterSpacing:".02em" }}>safebash</span>
            <span style={{ color:"var(--ink-4)" }}>·</span>
            <span style={{ fontSize:11, color:"var(--ink-3)" }}>v0.9.3</span>
          </div>
          <span style={{ width:1, height:14, background:"var(--line)" }} />
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"var(--good)" }}>$</span>
            {cmds.map(c => (
              <span key={c.k} style={{
                padding:"3px 8px", borderRadius:4, fontSize:11.5,
                background: c.k===active?"var(--panel-2)":"transparent",
                color: c.k===active?"var(--good)":"var(--ink-3)",
                border: c.k===active?"1px solid var(--good-line)":"1px solid transparent",
              }}>{c.k}</span>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span className="pill"><span className="dot" style={{ color:"var(--good)" }}/>registry · sync 14s</span>
          <span style={{ fontSize:11.5, color:"var(--ink-3)" }}>
            <span style={{ color:"var(--ink-2)" }}>charlie</span>@safebash:~$
          </span>
        </div>
      </div>
    </header>
  );
}

// ── Input bar ──────────────────────────────────────────────────────────────

function TVInputBar() {
  return (
    <div className="panel" style={{ padding:0, display:"flex", alignItems:"stretch" }}>
      <div style={{ padding:"10px 14px", display:"flex", alignItems:"center", gap:8,
                    borderRight:"1px solid var(--line)", color:"var(--good)" }}>
        <Icon name="terminal" size={13}/>
        <span style={{ fontSize:12 }}>safebash audit</span>
      </div>
      <div style={{ flex:1, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ color:"var(--ink-3)", fontSize:12 }}>--url</span>
        <span style={{ color:"var(--ink)", fontSize:12.5 }}>{SAMPLE_URL}</span>
        <span style={{ color:"var(--ink-4)" }}>\</span>
        <span style={{ color:"var(--ink-3)", fontSize:12 }}>--mirror</span>
        <span style={{ color:"var(--ink-2)", fontSize:12 }}>registry.safebash.dev</span>
        <span style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
          <span className="pill"><span className="dot" style={{ color:"var(--good)" }}/>200 · 3.1 KB</span>
          <span className="pill"><Icon name="clock" size={10}/>parsed 124ms</span>
        </span>
      </div>
      <button className="btn btn--accent" style={{ borderRadius:0, borderLeft:"1px solid var(--line)",
                                                    borderTop:0, borderRight:0, borderBottom:0, padding:"0 18px" }}>
        <Icon name="play" size={12}/>RUN
      </button>
    </div>
  );
}

// ── Verdict block ──────────────────────────────────────────────────────────

function ASCIIBar({ value, width=24 }) {
  const filled = Math.round((value/100) * width);
  return (
    <span style={{ color: value>=80?"var(--good)":value>=60?"var(--warn)":"var(--bad)" }}>
      [{"█".repeat(filled)}<span style={{ color:"var(--ink-4)" }}>{"░".repeat(width-filled)}</span>]
    </span>
  );
}

function TVVerdict() {
  return (
    <div className="panel glow" style={{ padding:0, overflow:"hidden" }}>
      <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--line)",
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    background:"linear-gradient(180deg, rgba(126,224,161,.05) 0%, transparent 100%)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span className="cap">verdict</span>
          <span className="pill pill--good"><Icon name="check" size={10} stroke={2.5}/>TRUSTED</span>
          <span style={{ fontSize:11, color:"var(--ink-3)" }}>policy: acme-eng/strict.toml</span>
        </div>
        <span style={{ fontSize:11, color:"var(--ink-3)" }}>↳ exit 0 · safe to execute</span>
      </div>
      <div style={{ padding:"18px 16px", display:"flex", gap:24, alignItems:"center" }}>
        <div>
          <div style={{ fontSize:11, color:"var(--ink-3)", letterSpacing:".05em" }}>trust_score</div>
          <div style={{ fontSize:46, color:"var(--good)", fontWeight:600, lineHeight:1, marginTop:4, letterSpacing:"-.02em" }}>
            {SIGNALS.score}<span style={{ fontSize:18, color:"var(--ink-3)" }}>/100</span>
          </div>
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5, fontSize:11.5 }}>
          {[
            { l:"provenance", v:96 },{ l:"network   ", v:84 },
            { l:"filesystem", v:78 },{ l:"privilege ", v:92 },{ l:"community ", v:88 },
          ].map((r,i) => (
            <div key={i} style={{ display:"flex", gap:14, alignItems:"center" }}>
              <span style={{ color:"var(--ink-3)", width:90 }}>{r.l}</span>
              <ASCIIBar value={r.v} />
              <span style={{ color:"var(--ink-2)", width:30, textAlign:"right" }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Code panel (terminal-styled) ───────────────────────────────────────────

function TVCode() {
  const colorOf = (r) => r==="high"?"var(--bad)":r==="med"?"var(--warn)":"var(--good)";
  const bgOf    = (r) => r==="high"?"var(--bad-bg)":r==="med"?"var(--warn-bg)":"var(--good-bg)";
  return (
    <div className="panel" style={{ overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"9px 14px", borderBottom:"1px solid var(--line)",
                    background:"var(--panel-2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:11.5 }}>
          <span style={{ color:"var(--ink-3)" }}>$</span>
          <span style={{ color:"var(--good)" }}>cat</span>
          <span style={{ color:"var(--ink)" }}>install.sh</span>
          <span style={{ color:"var(--ink-4)" }}>|</span>
          <span style={{ color:"var(--good)" }}>sb-annotate</span>
        </div>
        <div style={{ display:"flex", gap:6, fontSize:10.5 }}>
          <span className="pill">--diff</span>
          <span className="pill">--raw</span>
          <span className="pill" style={{ color:"var(--good)" }}>--annotated ✓</span>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"42px 1fr", fontSize:12, lineHeight:"20px" }}>
        {SAMPLE_BASH.map((l,i) => {
          const a = !!l.note;
          return (
            <React.Fragment key={i}>
              <span style={{
                textAlign:"right", paddingRight:10, color:"var(--ink-4)",
                background: a?bgOf(l.risk):"transparent",
                borderRight:"1px solid var(--line)",
              }}>{l.n}</span>
              <div style={{ padding:"0 14px", background:a?bgOf(l.risk):"transparent" }}>
                <code style={{ whiteSpace:"pre", color: l.code.trim().startsWith("#") ? "var(--ink-3)" : "var(--ink)" }}>
                  {l.code || " "}
                </code>
                {a && (
                  <div style={{ fontSize:11, color:colorOf(l.risk), lineHeight:"15px",
                                padding:"2px 0 6px", display:"flex", gap:6 }}>
                    <span>↳</span>
                    <span style={{ color:colorOf(l.risk), letterSpacing:".05em" }}>{l.risk.toUpperCase()}</span>
                    <span style={{ color:"var(--ink-2)" }}>{l.note}</span>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Side panels ────────────────────────────────────────────────────────────

function TVSection({ title, count, children }) {
  return (
    <div className="panel" style={{ padding:0 }}>
      <div style={{ padding:"9px 14px", borderBottom:"1px solid var(--line)", display:"flex",
                    justifyContent:"space-between", alignItems:"center", background:"var(--panel-2)" }}>
        <span className="cap">{title}</span>
        {count != null && <span style={{ fontSize:10.5, color:"var(--ink-3)" }}>{count}</span>}
      </div>
      <div style={{ padding:"12px 14px" }}>{children}</div>
    </div>
  );
}

function TVKV({ k, v, c }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11.5, gap:10, padding:"4px 0" }}>
      <span style={{ color:"var(--ink-3)" }}>{k}</span>
      <span style={{ color: c||"var(--ink)", textAlign:"right" }}>{v}</span>
    </div>
  );
}

function TVActions() {
  const sym = { fs:"fs",net:"net",sig:"sig",exec:"exec",priv:"priv" };
  const col = (lvl) => lvl==="high"?"var(--bad)":lvl==="med"?"var(--warn)":"var(--good)";
  return (
    <TVSection title="actions detected" count={ACTIONS.length}>
      {ACTIONS.map((a,i) => (
        <div key={i} style={{ display:"flex", gap:10, padding:"6px 0", borderTop:i?"1px solid var(--line-2)":"none" }}>
          <span style={{ width:38, color:col(a.level), fontSize:10.5, letterSpacing:".06em" }}>[{sym[a.kind]}]</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, color:"var(--ink)" }}>{a.label}</div>
            <div style={{ fontSize:11, color:"var(--ink-3)", marginTop:2 }}>{a.detail}</div>
          </div>
        </div>
      ))}
    </TVSection>
  );
}

function TVNetwork() {
  return (
    <TVSection title="egress" count={`${NETWORK.length} host`}>
      {NETWORK.map((n,i) => (
        <div key={i}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:"var(--good)" }}>→ {n.host}</span>
            <span className="pill pill--good">{n.reputation}</span>
          </div>
          <div style={{ fontSize:11, color:"var(--ink-3)", marginTop:4 }}>{n.ip} · {n.proto}:{n.port}</div>
          <div style={{ fontSize:11, color:"var(--ink-3)" }}>{n.note}</div>
        </div>
      ))}
    </TVSection>
  );
}

function TVFiles() {
  const c = (op) => op==="create"?"var(--good)":op==="append"?"var(--warn)":"var(--bad)";
  return (
    <TVSection title="filesystem" count={`${FILES_TOUCHED.length} paths`}>
      {FILES_TOUCHED.map((f,i) => (
        <div key={i} style={{ display:"grid", gridTemplateColumns:"56px 1fr 44px",
                              padding:"5px 0", fontSize:11.5, alignItems:"center",
                              borderTop: i?"1px solid var(--line-2)":"none" }}>
          <span style={{ color:c(f.op), letterSpacing:".06em" }}>{f.op.toUpperCase()}</span>
          <span style={{ color:"var(--ink-2)" }}>{f.path}</span>
          <span style={{ color:"var(--ink-3)", textAlign:"right" }}>{f.perms}</span>
        </div>
      ))}
    </TVSection>
  );
}

function TVProvenance() {
  return (
    <TVSection title="provenance">
      <TVKV k="publisher"    v={<>nodefoundry.dev <span className="pill pill--good" style={{ padding:"0 5px", fontSize:9.5 }}>verified</span></>} />
      <TVKV k="signed"       v="cosign · pinned key" c="var(--good)" />
      <TVKV k="sha256"       v={SIGNALS.hash} />
      <TVKV k="first_seen"   v={SIGNALS.firstSeen} />
      <TVKV k="last_review"  v={`${SIGNALS.lastReviewed} · 3 reviewers`} />
      <TVKV k="vouches"      v={`${SIGNALS.vouches.toLocaleString()}`} c="var(--good)" />
    </TVSection>
  );
}

function TVCommunity() {
  return (
    <TVSection title="peer review" count={`${SIGNALS.reviewers} reviewers`}>
      {COMMUNITY.map((c,i) => (
        <div key={i} style={{ padding:"7px 0", borderTop:i?"1px solid var(--line-2)":"none" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", fontSize:11.5 }}>
            <span style={{ color:"var(--good)" }}>{c.who}</span>
            <span style={{ color:"var(--ink-4)", fontSize:10.5 }}>· {c.when}</span>
          </div>
          <div style={{ fontSize:11, color:"var(--ink-2)", marginTop:3, lineHeight:1.5 }}>{c.body}</div>
        </div>
      ))}
    </TVSection>
  );
}

// ── Analyzer ───────────────────────────────────────────────────────────────

function TVAnalyzer() {
  return (
    <div className="tv" data-screen-label="C.1 · Analyzer (terminal)" style={{ width:"100%", height:"100%" }}>
      <TVHeader active="audit" />
      <div style={{ padding:"20px 24px 24px", display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <div style={{ fontSize:11, color:"var(--ink-3)" }}>./audit/nodefoundry/v2.4.1</div>
            <h1 style={{ fontSize:22, fontWeight:600, letterSpacing:"-.01em", margin:"4px 0 4px" }}>
              <span style={{ color:"var(--good)" }}>$ </span>nodefoundry-install
              <span style={{ color:"var(--ink-3)" }}> · 2.4.1</span>
            </h1>
            <div style={{ fontSize:11.5, color:"var(--ink-3)" }}>
              {SIGNALS.hash} · {SIGNALS.size} · {SIGNALS.lines} lines · Δ vs {SIGNALS.diff.prevVersion}: +{SIGNALS.diff.added} −{SIGNALS.diff.removed}
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button className="btn"><Icon name="diff" size={11}/>diff</button>
            <button className="btn"><Icon name="upload" size={11}/>export</button>
            <button className="btn btn--accent"><Icon name="check" size={11} stroke={2.5}/>approve</button>
          </div>
        </div>

        <TVInputBar />
        <TVVerdict />

        <div style={{ display:"grid", gridTemplateColumns:"1.55fr 1fr", gap:14 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <TVCode />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <TVNetwork />
              <TVFiles />
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <TVProvenance />
            <TVActions />
            <TVCommunity />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Library ────────────────────────────────────────────────────────────────

function TVLibrary() {
  const stats = [
    { l:"tracked",     v:"184", c:"var(--ink)" },
    { l:"trusted",     v:"162", c:"var(--good)" },
    { l:"caution",     v:"18",  c:"var(--warn)" },
    { l:"blocked",     v:"4",   c:"var(--bad)" },
  ];
  return (
    <div className="tv" data-screen-label="C.2 · Library (terminal)" style={{ width:"100%", height:"100%" }}>
      <TVHeader active="library" />
      <div style={{ padding:"20px 24px 24px", display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:600, letterSpacing:"-.01em", margin:0 }}>
              <span style={{ color:"var(--good)" }}>$ </span>safebash library --list
            </h1>
            <div style={{ fontSize:11.5, color:"var(--ink-3)", marginTop:6 }}>
              184 scripts indexed · 12 saved · synced 14s ago
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button className="btn"><Icon name="sliders" size={11}/>filter</button>
            <button className="btn"><Icon name="upload" size={11}/>export</button>
            <button className="btn btn--accent"><Icon name="plus" size={11}/>new audit</button>
          </div>
        </div>

        {/* stat strip — ASCII feel */}
        <div className="panel" style={{ padding:"12px 16px", display:"flex", gap:32 }}>
          {stats.map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"baseline", gap:8 }}>
              <span style={{ fontSize:11, color:"var(--ink-3)" }}>{s.l}</span>
              <span style={{ fontSize:22, fontWeight:600, color:s.c, letterSpacing:"-.02em" }}>{s.v}</span>
            </div>
          ))}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8, fontSize:11, color:"var(--ink-3)" }}>
            <Icon name="search" size={12}/>
            <span style={{ color:"var(--ink-2)" }}>find</span>
            <span style={{ color:"var(--good)" }}>verdict:trusted</span>
            <span>publisher:*</span>
            <span style={{ color:"var(--ink-4)" }}>↵</span>
          </div>
        </div>

        <div className="panel" style={{ padding:0, overflow:"hidden" }}>
          {/* header row */}
          <div style={{ display:"grid", gridTemplateColumns:"28px 1.5fr 0.6fr 1.2fr 1fr 0.7fr 0.7fr",
                        padding:"9px 16px", borderBottom:"1px solid var(--line)",
                        background:"var(--panel-2)", fontSize:10.5, color:"var(--ink-3)",
                        letterSpacing:".1em", textTransform:"uppercase" }}>
            <span></span><span>script</span><span>ver</span><span>publisher</span>
            <span>verdict</span><span>vouch</span><span style={{ textAlign:"right" }}>audited</span>
          </div>
          {LIBRARY.map((row,i) => {
            const c = row.verdict==="trusted"?"good":row.verdict==="caution"?"warn":"bad";
            return (
              <div key={i} style={{
                display:"grid", gridTemplateColumns:"28px 1.5fr 0.6fr 1.2fr 1fr 0.7fr 0.7fr",
                padding:"10px 16px", alignItems:"center", fontSize:12,
                borderBottom: i===LIBRARY.length-1?"none":"1px solid var(--line-2)",
                background: row.current ? "var(--good-bg)" : "transparent",
              }}>
                <span style={{ color:"var(--ink-4)" }}>
                  {row.current ? <span style={{ color:"var(--good)" }}>▸</span> : row.saved ? "★" : ""}
                </span>
                <span style={{ color:"var(--ink)" }}>{row.name}</span>
                <span style={{ color:"var(--ink-3)" }}>{row.v}</span>
                <span style={{ color:"var(--ink-2)" }}>{row.who}</span>
                <span>
                  <span className={`pill pill--${c}`}>
                    <span style={{ fontWeight:600 }}>{row.score}</span>
                    <span style={{ letterSpacing:".05em" }}>{row.verdict.toUpperCase()}</span>
                  </span>
                </span>
                <span style={{ color:"var(--ink-2)" }}>{row.vouches}</span>
                <span style={{ color:"var(--ink-3)", textAlign:"right" }}>{row.when}</span>
              </div>
            );
          })}
        </div>

        {/* Log strip */}
        <div className="panel" style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:5 }}>
          <span className="cap" style={{ marginBottom:4 }}>~/safebash/log.tail</span>
          {[
            { t:"[OK]",   c:"var(--good)", m:"approve nodefoundry@2.4.1   · charlie  · 2m" },
            { t:"[WARN]", c:"var(--warn)", m:"flag    ollama@0.1.39       · auto     · 4h  · new sudo prompt detected" },
            { t:"[FAIL]", c:"var(--bad)",  m:"block   fly-cli-rc@*        · policy   · 1d  · typosquat: fly.io" },
            { t:"[OK]",   c:"var(--good)", m:"verify  rustup@1.27.1       · @charlie · 3d" },
            { t:"[INFO]", c:"var(--ink-2)",m:"sync    registry            · cron     · 14s · 12 new vouches" },
          ].map((l,i) => (
            <div key={i} style={{ display:"flex", gap:10, fontSize:11.5 }}>
              <span style={{ color:"var(--ink-4)", width:50 }}>{String(i+1).padStart(2,"0")} ·</span>
              <span style={{ color:l.c, width:54 }}>{l.t}</span>
              <span style={{ color:"var(--ink-2)" }}>{l.m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TVAnalyzer, TVLibrary });
