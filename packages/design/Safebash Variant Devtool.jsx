// variant-devtool.jsx — "Linear/Vercel clean." Quiet, spacious, single accent.

const { Icon, SAMPLE_URL, SAMPLE_BASH, SIGNALS, ACTIONS, NETWORK,
        FILES_TOUCHED, DIFF_LINES, COMMUNITY, LIBRARY } = window;

const DT_TOKENS = `
  .dt { --bg:#ffffff; --paper:#ffffff; --ink:#0b0c0e; --ink-2:#3a3d44;
        --ink-3:#7a808a; --ink-4:#a9aeb6; --line:#ececef; --line-2:#f4f4f6;
        --good:#0c6b58; --warn:#a04a00; --bad:#a8201a;
        --good-bg:#e6f4ef; --warn-bg:#fbeedf; --bad-bg:#fbe5e2;
        --accent: var(--safebash-accent, #0b0c0e);
        font-family:'Geist','Inter','Inter Tight',-apple-system,system-ui,sans-serif;
        background:var(--bg); color:var(--ink); -webkit-font-smoothing:antialiased;
        font-feature-settings:"ss01","cv11","tnum"; }
  .dt .mono, .dt code, .dt pre {
        font-family:'Geist Mono','JetBrains Mono','IBM Plex Mono',ui-monospace,monospace; }
  .dt .card { border:1px solid var(--line); border-radius:12px; background:var(--paper); }
  .dt .h1 { font-size:26px; font-weight:600; letter-spacing:-0.025em; margin:0; }
  .dt .h2 { font-size:14px; font-weight:600; letter-spacing:-0.005em; margin:0; }
  .dt .muted { color:var(--ink-3); }
  .dt .small { font-size:12px; color:var(--ink-3); }
  .dt .btn { display:inline-flex; align-items:center; gap:7px; padding:7px 12px;
             border-radius:8px; font-size:13px; font-weight:500;
             border:1px solid var(--line); background:#fff; color:var(--ink);
             cursor:pointer; transition:background .12s, border-color .12s; }
  .dt .btn:hover { border-color:var(--ink-4); }
  .dt .btn--primary { background:var(--accent); color:#fff; border-color:var(--accent); }
  .dt .btn--ghost { border-color:transparent; background:transparent; color:var(--ink-2); }
  .dt .chip { display:inline-flex; align-items:center; gap:6px; padding:3px 9px;
              border-radius:999px; font-size:11.5px; font-weight:500;
              background:var(--line-2); color:var(--ink-2); border:1px solid transparent; }
  .dt .chip--good { background:var(--good-bg); color:var(--good); }
  .dt .chip--warn { background:var(--warn-bg); color:var(--warn); }
  .dt .chip--bad  { background:var(--bad-bg);  color:var(--bad);  }
  .dt .dot { width:6px; height:6px; border-radius:50%; background:currentColor; }
  .dt hr { border:0; height:1px; background:var(--line); margin:0; }
`;

if (typeof document !== "undefined" && !document.getElementById("dt-tokens")) {
  const s = document.createElement("style"); s.id = "dt-tokens";
  s.textContent = DT_TOKENS; document.head.appendChild(s);
}

// ── Header ─────────────────────────────────────────────────────────────────

function DTHeader({ active="Analyze" }) {
  const tabs = ["Analyze","Library","Trusted","Community","Settings"];
  return (
    <header style={{ borderBottom:"1px solid var(--line)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"14px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:22, height:22, borderRadius:6, background:"var(--ink)",
                        display:"grid", placeItems:"center", color:"#fff" }}>
            <Icon name="shield" size={12} stroke={2.2}/>
          </div>
          <span style={{ fontSize:14.5, fontWeight:600, letterSpacing:"-0.01em" }}>SafeBash</span>
          <span style={{ color:"var(--ink-4)" }}>/</span>
          <span style={{ fontSize:13.5, color:"var(--ink-2)" }}>acme-eng</span>
          <span className="chip" style={{ marginLeft:6 }}>free</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button className="btn btn--ghost" style={{ fontSize:12.5 }}><Icon name="search" size={13}/>Search<span className="chip" style={{ marginLeft:4, background:"var(--line-2)" }}>⌘K</span></button>
          <button className="btn"><Icon name="key" size={13}/>Sign in</button>
        </div>
      </div>
      <div style={{ display:"flex", gap:0, padding:"0 24px" }}>
        {tabs.map(t => (
          <a key={t} style={{
            padding:"10px 12px", fontSize:13, color: t===active?"var(--ink)":"var(--ink-3)",
            fontWeight:500, position:"relative", textDecoration:"none",
            borderBottom: t===active ? "1.5px solid var(--ink)" : "1.5px solid transparent",
            marginBottom:-1,
          }}>{t}</a>
        ))}
      </div>
    </header>
  );
}

// ── Hero input + verdict banner ────────────────────────────────────────────

function DTInputCard() {
  return (
    <div className="card" style={{ padding:18 }}>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <div style={{ display:"flex", background:"var(--line-2)", borderRadius:8, padding:3 }}>
          {[{i:"link",l:"URL"},{i:"terminal",l:"Paste"},{i:"upload",l:"Upload"}].map((t,i)=>(
            <span key={i} style={{
              padding:"5px 11px", borderRadius:5, fontSize:12.5, fontWeight:500,
              display:"flex", alignItems:"center", gap:6,
              background: i===0?"#fff":"transparent",
              color: i===0?"var(--ink)":"var(--ink-3)",
              boxShadow: i===0?"0 1px 2px rgba(0,0,0,.04)":"none",
            }}><Icon name={t.i} size={12}/>{t.l}</span>
          ))}
        </div>
        <div style={{ flex:1, display:"flex", alignItems:"center", height:38,
                      border:"1px solid var(--line)", borderRadius:8, padding:"0 12px", gap:8 }}>
          <Icon name="link" size={13} />
          <span className="mono" style={{ fontSize:13 }}>{SAMPLE_URL}</span>
          <span className="chip chip--good" style={{ marginLeft:"auto" }}>
            <Icon name="check" size={10} stroke={2.5}/>200 OK
          </span>
        </div>
        <button className="btn btn--primary" style={{ height:38 }}>
          <Icon name="shield" size={13}/>Audit
        </button>
      </div>
      <div style={{ display:"flex", gap:14, marginTop:12, fontSize:12, color:"var(--ink-3)" }}>
        <span style={{ display:"flex", alignItems:"center", gap:6 }}>
          <Icon name="info" size={12}/>SafeBash never executes the script. It is parsed locally, then signed and stored.
        </span>
      </div>
    </div>
  );
}

function DTVerdictBanner() {
  return (
    <div className="card" style={{ padding:0, overflow:"hidden" }}>
      <div style={{ padding:"20px 22px", background:"linear-gradient(180deg, #f7fbf9 0%, #fff 100%)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:18 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <span className="chip chip--good" style={{ fontSize:12, padding:"4px 10px" }}>
                <Icon name="check" size={12} stroke={2.5}/>Trusted
              </span>
              <span style={{ fontSize:12, color:"var(--ink-3)" }}>Verdict score</span>
              <span style={{ fontSize:18, fontWeight:600, color:"var(--good)", fontVariantNumeric:"tabular-nums" }}>{SIGNALS.score}<span style={{ color:"var(--ink-4)", fontSize:13, fontWeight:400 }}>/100</span></span>
            </div>
            <h2 style={{ fontSize:20, margin:0, fontWeight:600, letterSpacing:"-0.015em" }}>
              nodefoundry-install <span style={{ color:"var(--ink-3)", fontWeight:400 }}>· v2.4.1</span>
            </h2>
            <div style={{ color:"var(--ink-3)", fontSize:13, marginTop:4 }}>
              Signed by <span style={{ color:"var(--ink-2)" }}>nodefoundry-release</span>, vouched by
              <span style={{ color:"var(--ink-2)" }}> 1,247 developers</span>. Within your org policy.
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn"><Icon name="diff" size={13}/>Diff</button>
            <button className="btn"><Icon name="pin" size={13}/>Save</button>
            <button className="btn btn--primary"><Icon name="terminal" size={13}/>Copy install command</button>
          </div>
        </div>
        {/* 5-bar score row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginTop:18 }}>
          {[
            { l:"Provenance", v:96 },{ l:"Network", v:84 },
            { l:"Filesystem", v:78 },{ l:"Privilege", v:92 },{ l:"Community", v:88 },
          ].map((s,i) => (
            <div key={i}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11.5, marginBottom:5 }}>
                <span style={{ color:"var(--ink-3)" }}>{s.l}</span>
                <span className="mono" style={{ color:"var(--ink-2)", fontWeight:500 }}>{s.v}</span>
              </div>
              <div style={{ height:3, borderRadius:2, background:"var(--line-2)", overflow:"hidden" }}>
                <div style={{ width:`${s.v}%`, height:"100%", background:s.v>=80?"var(--good)":s.v>=60?"var(--warn)":"var(--bad)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Annotated code (cleaner gutter version) ────────────────────────────────

function DTCode() {
  const colorOf = (r) => r==="high"?"var(--bad)":r==="med"?"var(--warn)":"var(--good)";
  return (
    <div className="card" style={{ overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"11px 16px", borderBottom:"1px solid var(--line)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <h3 className="h2">install.sh</h3>
          <span className="chip mono" style={{ fontSize:11 }}>34 lines</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {["annotated","raw","diff"].map((t,i) => (
            <span key={t} style={{
              padding:"4px 10px", borderRadius:6, fontSize:11.5,
              background: i===0?"var(--line-2)":"transparent",
              color: i===0?"var(--ink)":"var(--ink-3)", fontWeight:500,
            }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ padding:"14px 0" }}>
        {SAMPLE_BASH.map((l,i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"42px 14px 1fr",
                                 padding:"0 18px 0 0", alignItems:"start", minHeight:21 }}>
            <span className="mono" style={{ fontSize:11.5, color:"var(--ink-4)",
                  textAlign:"right", paddingRight:12, lineHeight:"21px" }}>{l.n}</span>
            <span style={{ width:3, alignSelf:"stretch", background: l.note?colorOf(l.risk):"transparent",
                           borderRadius:2 }} />
            <div style={{ paddingLeft:10 }}>
              <code className="mono" style={{ fontSize:12.5, whiteSpace:"pre", lineHeight:"21px" }}>{l.code || " "}</code>
              {l.note && (
                <div style={{ fontSize:11.5, color:"var(--ink-3)", lineHeight:"16px",
                              padding:"3px 0 6px", display:"flex", gap:6 }}>
                  <span style={{ color:colorOf(l.risk), fontWeight:500 }}>{l.risk}</span>
                  <span>·</span>
                  <span>{l.note}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Right-rail (smaller, more whitespace) ──────────────────────────────────

function DTKVRow({ k, v, mono, accent }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, padding:"7px 0",
                  borderBottom:"1px solid var(--line-2)" }}>
      <span style={{ color:"var(--ink-3)" }}>{k}</span>
      <span className={mono?"mono":""} style={{ color: accent||"var(--ink)", fontWeight:500, textAlign:"right" }}>{v}</span>
    </div>
  );
}

function DTSidePanels() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div className="card" style={{ padding:16 }}>
        <h3 className="h2" style={{ marginBottom:6 }}>What it does</h3>
        <p className="small" style={{ margin:"0 0 12px" }}>Plain-English summary of the six concrete actions.</p>
        {ACTIONS.map((a,i) => {
          const c = a.level==="high"?"var(--bad)":a.level==="med"?"var(--warn)":"var(--good)";
          return (
            <div key={i} style={{ display:"flex", gap:10, padding:"9px 0",
                                  borderTop:i?"1px solid var(--line-2)":"none" }}>
              <div style={{ width:6, height:6, borderRadius:3, background:c, marginTop:7, flex:"0 0 auto" }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{a.label}</div>
                <div className="small" style={{ marginTop:1 }}>{a.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding:16 }}>
        <h3 className="h2" style={{ marginBottom:8 }}>Provenance</h3>
        <DTKVRow k="Publisher" v={<span>nodefoundry.dev <span className="chip chip--good" style={{ marginLeft:4, padding:"1px 6px", fontSize:10 }}>verified</span></span>} />
        <DTKVRow k="Signed" v={SIGNALS.signedBy} />
        <DTKVRow k="SHA-256" v={SIGNALS.hash} mono />
        <DTKVRow k="First seen" v={SIGNALS.firstSeen} mono />
        <DTKVRow k="Reviewed" v={`${SIGNALS.lastReviewed} · 3 reviewers`} />
      </div>

      <div className="card" style={{ padding:16 }}>
        <h3 className="h2" style={{ marginBottom:8 }}>Network</h3>
        {NETWORK.map((n,i) => (
          <div key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span className="mono" style={{ fontSize:12.5 }}>{n.host}</span>
              <span className="chip chip--good" style={{ padding:"1px 7px", fontSize:10.5 }}>verified</span>
            </div>
            <div className="small mono" style={{ marginTop:3 }}>{n.ip} · {n.proto}:{n.port}</div>
            <div className="small" style={{ marginTop:2 }}>{n.note}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:16 }}>
        <h3 className="h2" style={{ marginBottom:8 }}>Files touched · {FILES_TOUCHED.length}</h3>
        {FILES_TOUCHED.map((f,i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:12,
                                padding:"6px 0", borderTop:i?"1px solid var(--line-2)":"none" }}>
            <span className="mono">{f.path}</span>
            <span className="small mono">{f.op}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:16 }}>
        <h3 className="h2" style={{ marginBottom:10 }}>Community</h3>
        {COMMUNITY.slice(0,2).map((c,i) => (
          <div key={i} style={{ padding:"8px 0", borderTop:i?"1px solid var(--line-2)":"none" }}>
            <div style={{ display:"flex", gap:6, fontSize:12.5, alignItems:"baseline" }}>
              <span style={{ fontWeight:500 }}>{c.who}</span>
              {c.role.includes("verified") &&
                <span className="chip chip--good" style={{ padding:"0 6px", fontSize:10 }}>verified</span>}
              <span className="small">· {c.when}</span>
            </div>
            <div className="small" style={{ marginTop:3, color:"var(--ink-2)", lineHeight:1.45 }}>{c.body}</div>
          </div>
        ))}
        <button className="btn" style={{ width:"100%", marginTop:10, justifyContent:"center" }}>
          See {SIGNALS.vouches.toLocaleString()} reviews
        </button>
      </div>
    </div>
  );
}

// ── Analyzer composed ──────────────────────────────────────────────────────

function DTAnalyzer() {
  return (
    <div className="dt" data-screen-label="B.1 · Analyzer (devtool)" style={{ width:"100%", height:"100%" }}>
      <DTHeader active="Analyze" />
      <div style={{ padding:"28px 32px 32px", display:"flex", flexDirection:"column", gap:18 }}>
        <div>
          <div style={{ display:"flex", gap:8, color:"var(--ink-3)", fontSize:13, marginBottom:6 }}>
            <span>Library</span><span>/</span><span>nodefoundry</span><span>/</span><span style={{ color:"var(--ink)" }}>v2.4.1</span>
          </div>
          <h1 className="h1">Audit a script</h1>
          <p className="muted" style={{ margin:"6px 0 0", fontSize:14 }}>Paste a URL, raw bash, or upload a file. We never execute it — we parse it, sign it, and store it for the next time you see it.</p>
        </div>
        <DTInputCard />
        <DTVerdictBanner />
        <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:18 }}>
          <DTCode />
          <DTSidePanels />
        </div>
      </div>
    </div>
  );
}

// ── Library ────────────────────────────────────────────────────────────────

function DTLibrary() {
  return (
    <div className="dt" data-screen-label="B.2 · Library (devtool)" style={{ width:"100%", height:"100%" }}>
      <DTHeader active="Library" />
      <div style={{ padding:"28px 32px 32px", display:"flex", flexDirection:"column", gap:22 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <h1 className="h1">Library</h1>
            <p className="muted" style={{ margin:"6px 0 0", fontSize:14 }}>
              Audited scripts, ordered by recency. Saved and current versions are highlighted.
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn"><Icon name="sliders" size={13}/>Filters</button>
            <button className="btn btn--primary"><Icon name="plus" size={13}/>Audit a script</button>
          </div>
        </div>

        {/* tabs + search */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", gap:0 }}>
            {[
              { l:"All",      n:184 },
              { l:"Trusted",  n:162 },
              { l:"Caution",  n:18  },
              { l:"Danger",   n:4   },
              { l:"Saved",    n:12  },
            ].map((t,i) => (
              <span key={t.l} style={{
                padding:"7px 14px", fontSize:13, fontWeight:500,
                color: i===0?"var(--ink)":"var(--ink-3)",
                borderBottom: i===0?"1.5px solid var(--ink)":"1.5px solid transparent",
                marginBottom:-1, display:"flex", gap:6, alignItems:"center",
              }}>{t.l}<span className="small mono" style={{ color:"var(--ink-4)" }}>{t.n}</span></span>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 10px",
                          border:"1px solid var(--line)", borderRadius:8, height:32 }}>
              <Icon name="search" size={13} />
              <span className="mono" style={{ fontSize:12, color:"var(--ink-3)" }}>Search by name, hash, publisher…</span>
            </div>
          </div>
        </div>

        {/* card grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
          {LIBRARY.map((row,i) => {
            const chip = row.verdict==="trusted"?"good":row.verdict==="caution"?"warn":"bad";
            return (
              <div key={i} className="card" style={{ padding:16, display:"flex", flexDirection:"column", gap:10,
                background: row.current ? "linear-gradient(180deg, #f7fbf9 0%, #fff 60%)" : "#fff" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <h3 style={{ fontSize:14.5, margin:0, fontWeight:600, letterSpacing:"-0.01em" }}>{row.name}</h3>
                      <span className="mono small">v{row.v}</span>
                      {row.current && <span className="chip chip--good" style={{ padding:"0 7px", fontSize:10 }}>current</span>}
                    </div>
                    <div className="small" style={{ marginTop:3 }}>{row.who}</div>
                  </div>
                  <span className={`chip chip--${chip}`}>
                    <span className="mono" style={{ fontWeight:600 }}>{row.score}</span>
                    {row.verdict}
                  </span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:"auto",
                              paddingTop:10, borderTop:"1px solid var(--line-2)", fontSize:11.5, color:"var(--ink-3)" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <Icon name="clock" size={11}/>{row.when}
                  </span>
                  <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <Icon name="star" size={11}/>{row.vouches}
                  </span>
                  {row.saved && <span style={{ display:"flex", alignItems:"center", gap:5, color:"var(--ink-2)" }}>
                    <Icon name="pin" size={11}/>saved
                  </span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DTAnalyzer, DTLibrary });
