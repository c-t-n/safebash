// variant-trustbank.jsx — "Stripe meets a security audit report."
// Off-white, deep ink, sage success. Signal-dense, badge-rich.

const { Icon, classNames, SAMPLE_URL, SAMPLE_BASH, SIGNALS, ACTIONS,
        NETWORK, FILES_TOUCHED, DIFF_LINES, COMMUNITY, LIBRARY } = window;

// ─── Tokens ─────────────────────────────────────────────────────────────────
const TB_TOKENS = `
  .tb { --bg: #f6f4ee; --paper: #ffffff; --inv: #ffffff;
        --ink: #0e1a2b; --ink-2: #2a3a52;
        --ink-3: #5c6b82; --line: #e3ddcf; --line-2: #ecead9;
        --header-tint: #fafaf3;
        --good: #1d6b4f; --good-bg: #e2efe6; --good-line: #c4dccd;
        --warn: #9a6b15; --warn-bg: #f7ecd1; --warn-line: #e5cfa3;
        --bad:  #963122; --bad-bg:  #f6dfd7; --bad-line:  #e9bfb1;
        --add-bg: rgba(29,107,79,.08); --del-bg: rgba(150,49,34,.08);
        --row-current: rgba(29,107,79,.04);
        --accent: var(--safebash-accent, #1d6b4f);
        font-family: 'Inter', 'Inter Tight', -apple-system, system-ui, sans-serif;
        background: var(--bg); color: var(--ink);
        font-feature-settings: "ss01","cv11","tnum";
        -webkit-font-smoothing: antialiased; }

  /* Dark variant — warm charcoal, same hue temperature as the light off-white */
  .tb.dark { --bg: #14130f; --paper: #1c1b17; --inv: #14130f;
             --ink: #ebe6db; --ink-2: #b6afa1;
             --ink-3: #847e72; --line: #2a2823; --line-2: #232119;
             --header-tint: #1f1e1a;
             --good: #6ec99a; --good-bg: rgba(110,201,154,.10); --good-line: rgba(110,201,154,.26);
             --warn: #e5b96b; --warn-bg: rgba(229,185,107,.10); --warn-line: rgba(229,185,107,.26);
             --bad:  #e58a7a; --bad-bg:  rgba(229,138,122,.10); --bad-line:  rgba(229,138,122,.26);
             --add-bg: rgba(110,201,154,.10); --del-bg: rgba(229,138,122,.10);
             --row-current: rgba(110,201,154,.06); }
  .tb code, .tb pre, .tb .mono { font-family: 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace; }

  .tb .card { background: var(--paper); border: 1px solid var(--line);
              border-radius: 10px; }
  .tb .cap  { font-size: 10.5px; font-weight: 600; letter-spacing: .08em;
              text-transform: uppercase; color: var(--ink-3); }
  .tb .btn  { display:inline-flex; align-items:center; gap:6px; padding:7px 12px;
              border-radius:7px; font-size:12.5px; font-weight:500;
              border:1px solid var(--line); background:var(--paper); color:var(--ink); cursor:pointer;}
  .tb .btn--ink { background: var(--ink); color: var(--inv); border-color: var(--ink); }
  .tb .btn--accent { background: var(--accent); color:#fff; border-color: var(--accent); }
  .tb .pill { display:inline-flex; align-items:center; gap:5px; padding:3px 8px;
              border-radius:999px; font-size:11px; font-weight:500;
              border:1px solid var(--line); background: var(--paper); color: var(--ink-2);}
  .tb .pill--good { background: var(--good-bg); border-color: var(--good-line); color: var(--good); }
  .tb .pill--warn { background: var(--warn-bg); border-color: var(--warn-line); color: var(--warn); }
  .tb .pill--bad  { background: var(--bad-bg);  border-color: var(--bad-line);  color: var(--bad);  }
  .tb .dot  { width:6px; height:6px; border-radius:50%; background: currentColor; }
  .tb .kbd  { font-family: inherit; font-size:10.5px; border:1px solid var(--line);
              border-bottom-width:2px; border-radius:5px; padding:1px 5px;
              color: var(--ink-3); background:var(--paper); }
  .tb .hairline { height:1px; background: var(--line); border:0; }
  .tb a { color: inherit; }
`;

if (typeof document !== "undefined" && !document.getElementById("tb-tokens")) {
  const s = document.createElement("style"); s.id = "tb-tokens";
  s.textContent = TB_TOKENS; document.head.appendChild(s);
}

// ─── Atoms ──────────────────────────────────────────────────────────────────

function TBLogo({ size = 14 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:24, height:24, borderRadius:6, background:"var(--ink)",
                    display:"grid", placeItems:"center", color:"var(--inv)" }}>
        <Icon name="shield" size={14} stroke={2} />
      </div>
      <div style={{ fontSize:15, fontWeight:600, letterSpacing:"-0.01em" }}>
        SafeBash<span style={{ color:"var(--ink-3)", fontWeight:400 }}> · audit</span>
      </div>
    </div>
  );
}

function TBHeader({ active = "Library", onNav }) {
  const tabs = ["Library", "Publish", "Trusted", "Community", "API"];
  return (
    <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                     padding:"14px 28px", borderBottom:"1px solid var(--line)", background:"var(--paper)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:32 }}>
        <TBLogo />
        <nav style={{ display:"flex", gap:4 }}>
          {tabs.map(t => (
            <a key={t} onClick={(e) => { e.preventDefault(); onNav && onNav(t); }} style={{
              padding:"6px 12px", borderRadius:6, fontSize:13, textDecoration:"none",
              color: t === active ? "var(--ink)" : "var(--ink-3)",
              fontWeight: t === active ? 600 : 500,
              background: t === active ? "var(--line-2)" : "transparent",
              cursor: "pointer",
            }}>{t}</a>
          ))}
        </nav>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div className="pill" style={{ gap:6 }}>
          <span className="dot" style={{ color:"var(--good)" }}></span>
          <span style={{ color:"var(--ink-3)" }}>registry · </span>
          <span style={{ fontWeight:500 }}>operational</span>
        </div>
        <button className="btn"><Icon name="key" size={13}/>Sign in with key</button>
        <button className="btn btn--ink"><Icon name="plus" size={13}/>New audit</button>
      </div>
    </header>
  );
}

function VerdictRing({ score, verdict }) {
  const c = verdict === "trusted" ? "var(--good)" : verdict === "caution" ? "var(--warn)" : "var(--bad)";
  const r = 44, C = 2 * Math.PI * r;
  const off = C * (1 - score / 100);
  return (
    <div style={{ position:"relative", width:120, height:120 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={c} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off}
                transform="rotate(-90 60 60)" />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"grid", placeItems:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:30, fontWeight:600, letterSpacing:"-0.02em", color:c, fontVariantNumeric:"tabular-nums" }}>{score}</div>
          <div className="cap" style={{ color:c, fontSize:9.5 }}>{verdict}</div>
        </div>
      </div>
    </div>
  );
}

function SubScore({ label, value, max = 100 }) {
  const pct = Math.round((value / max) * 100);
  const c = pct >= 80 ? "var(--good)" : pct >= 60 ? "var(--warn)" : "var(--bad)";
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11.5, marginBottom:5 }}>
        <span style={{ color:"var(--ink-2)", fontWeight:500 }}>{label}</span>
        <span className="mono" style={{ color:"var(--ink-3)" }}>{value}/{max}</span>
      </div>
      <div style={{ height:4, borderRadius:2, background:"var(--line)", overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:c }} />
      </div>
    </div>
  );
}

// ─── Code panel with inline annotations ─────────────────────────────────────

function AnnotatedCode() {
  const riskColor = (r) => r === "high" ? "var(--bad)" : r === "med" ? "var(--warn)" : "var(--good)";
  const riskBg    = (r) => r === "high" ? "var(--bad-bg)" : r === "med" ? "var(--warn-bg)" : "var(--good-bg)";
  return (
    <div className="card" style={{ overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"10px 14px", borderBottom:"1px solid var(--line)", background:"var(--header-tint)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Icon name="file" size={14} />
          <span className="mono" style={{ fontSize:12.5, fontWeight:500 }}>install.sh</span>
          <span className="pill"><span className="dot" style={{ color:"var(--good)" }}></span>signed</span>
          <span className="pill" style={{ color:"var(--ink-3)" }}>{SIGNALS.lines} lines · {SIGNALS.size}</span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button className="btn" style={{ padding:"4px 9px", fontSize:11.5 }}><Icon name="diff" size={12}/>diff</button>
          <button className="btn" style={{ padding:"4px 9px", fontSize:11.5 }}><Icon name="upload" size={12}/>raw</button>
          <button className="btn" style={{ padding:"4px 9px", fontSize:11.5 }}><Icon name="play" size={12}/>dry-run</button>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"38px 1fr", fontSize:12.5, lineHeight:"22px" }}>
        {SAMPLE_BASH.map((l, i) => {
          const annotated = !!l.note;
          return (
            <React.Fragment key={i}>
              <div className="mono" style={{
                textAlign:"right", padding:"0 10px 0 0", color:"var(--ink-3)",
                background: annotated ? riskBg(l.risk) : "transparent",
                borderRight:"1px solid var(--line)",
                fontVariantNumeric:"tabular-nums", fontSize:11.5,
              }}>{l.n}</div>
              <div style={{
                padding:"0 14px", background: annotated ? riskBg(l.risk) : "transparent",
                position:"relative",
              }}>
                <code className="mono" style={{ whiteSpace:"pre", color:"var(--ink)" }}>{l.code || " "}</code>
                {annotated && (
                  <div style={{
                    display:"flex", alignItems:"center", gap:8, marginTop:2, marginBottom:6,
                    paddingLeft:10, borderLeft:`2px solid ${riskColor(l.risk)}`,
                    color:riskColor(l.risk), fontSize:11.5, fontFamily:"inherit", lineHeight:"16px",
                  }}>
                    <Icon name={l.risk === "low" ? "check" : "alert"} size={11} stroke={2.2}/>
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

// ─── Right-rail panels ──────────────────────────────────────────────────────

function VerdictCard() {
  return (
    <div className="card" style={{ padding:18 }}>
      <div style={{ display:"flex", gap:18, alignItems:"center", marginBottom:14 }}>
        <VerdictRing score={SIGNALS.score} verdict={SIGNALS.verdict} />
        <div style={{ flex:1 }}>
          <div className="cap" style={{ marginBottom:4 }}>Verdict</div>
          <div style={{ fontSize:18, fontWeight:600, letterSpacing:"-0.01em" }}>Safe to execute</div>
          <div style={{ fontSize:12, color:"var(--ink-3)", marginTop:2 }}>
            Within policy. 2 medium-impact actions reviewed.
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gap:8 }}>
        <SubScore label="Signature & provenance" value={96} />
        <SubScore label="Network surface"        value={84} />
        <SubScore label="Filesystem impact"      value={78} />
        <SubScore label="Privilege scope"        value={92} />
        <SubScore label="Community trust"        value={88} />
      </div>
      <hr className="hairline" style={{ margin:"14px 0" }} />
      <div style={{ display:"flex", gap:8 }}>
        <button className="btn btn--accent" style={{ flex:1, justifyContent:"center" }}>
          <Icon name="check" size={13} stroke={2.4}/>Approve &amp; copy command
        </button>
        <button className="btn"><Icon name="pin" size={13}/></button>
      </div>
    </div>
  );
}

function IdentityCard() {
  return (
    <div className="card" style={{ padding:16 }}>
      <div className="cap" style={{ marginBottom:10 }}>Provenance</div>
      <div style={{ display:"grid", gridTemplateColumns:"110px 1fr", rowGap:7, fontSize:12 }}>
        <div style={{ color:"var(--ink-3)" }}>Publisher</div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontWeight:500 }}>{SIGNALS.publisher}</span>
          <span className="pill pill--good" style={{ padding:"1px 6px", fontSize:10 }}>
            <Icon name="check" size={9} stroke={2.5}/>verified
          </span>
        </div>
        <div style={{ color:"var(--ink-3)" }}>Signature</div>
        <div className="mono" style={{ fontSize:11.5 }}>{SIGNALS.signedBy}</div>
        <div style={{ color:"var(--ink-3)" }}>SHA-256</div>
        <div className="mono" style={{ fontSize:11.5, color:"var(--ink-2)" }}>{SIGNALS.hash}</div>
        <div style={{ color:"var(--ink-3)" }}>First seen</div>
        <div>{SIGNALS.firstSeen}</div>
        <div style={{ color:"var(--ink-3)" }}>Last reviewed</div>
        <div>{SIGNALS.lastReviewed} · by 3 reviewers</div>
        <div style={{ color:"var(--ink-3)" }}>Vouches</div>
        <div><span style={{ fontWeight:500 }}>{SIGNALS.vouches.toLocaleString()}</span> <span style={{ color:"var(--ink-3)" }}>this version</span></div>
      </div>
    </div>
  );
}

function ActionsCard() {
  const dot = (lvl) => lvl === "high" ? "var(--bad)" : lvl === "med" ? "var(--warn)" : "var(--good)";
  const ico = (k) => ({ fs:"folder", net:"network", sig:"key", exec:"terminal", priv:"user" }[k] || "info");
  return (
    <div className="card" style={{ padding:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
        <div className="cap">What it will do · {ACTIONS.length}</div>
        <a className="mono" style={{ fontSize:11, color:"var(--ink-3)" }}>policy ↗</a>
      </div>
      <div style={{ display:"flex", flexDirection:"column" }}>
        {ACTIONS.map((a, i) => (
          <div key={i} style={{
            display:"flex", gap:10, alignItems:"flex-start",
            padding:"10px 0", borderTop: i ? "1px solid var(--line-2)" : "none",
          }}>
            <div style={{
              width:24, height:24, borderRadius:6, background:"var(--line-2)",
              display:"grid", placeItems:"center", color:dot(a.level), flex:"0 0 auto",
            }}>
              <Icon name={ico(a.kind)} size={13}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12.5, fontWeight:500, display:"flex", alignItems:"center", gap:6 }}>
                {a.label}
                <span className="dot" style={{ color:dot(a.level) }}></span>
              </div>
              <div style={{ fontSize:11.5, color:"var(--ink-3)", marginTop:1 }}>{a.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NetworkCard() {
  return (
    <div className="card" style={{ padding:16 }}>
      <div className="cap" style={{ marginBottom:10 }}>Network egress · {NETWORK.length}</div>
      {NETWORK.map((n, i) => (
        <div key={i} style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"10px 0", borderTop: i ? "1px solid var(--line-2)" : "none",
        }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <Icon name="link" size={12}/>
              <span className="mono" style={{ fontSize:12 }}>{n.host}</span>
              <span className="pill pill--good" style={{ padding:"1px 6px", fontSize:10 }}>{n.reputation}</span>
            </div>
            <div className="mono" style={{ fontSize:11, color:"var(--ink-3)", marginTop:3 }}>
              {n.ip} · {n.proto}:{n.port} · {n.note}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FilesCard() {
  const colorOf = (op) => op === "create" ? "var(--good)" : op === "append" ? "var(--warn)" : op === "delete" ? "var(--bad)" : "var(--ink-3)";
  return (
    <div className="card" style={{ padding:16 }}>
      <div className="cap" style={{ marginBottom:10 }}>Filesystem · {FILES_TOUCHED.length} paths</div>
      <div style={{ display:"grid", gridTemplateColumns:"58px 1fr 60px", rowGap:6, alignItems:"center" }}>
        {FILES_TOUCHED.map((f, i) => (
          <React.Fragment key={i}>
            <span className="mono" style={{ fontSize:10.5, color:colorOf(f.op), textTransform:"uppercase", fontWeight:600 }}>{f.op}</span>
            <span className="mono" style={{ fontSize:11.5 }}>{f.path}</span>
            <span className="mono" style={{ fontSize:11, color:"var(--ink-3)", textAlign:"right" }}>{f.perms}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function DiffCard() {
  return (
    <div className="card" style={{ padding:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
        <div className="cap">Diff vs {SIGNALS.diff.prevVersion}</div>
        <div style={{ display:"flex", gap:6, fontSize:11 }}>
          <span style={{ color:"var(--good)" }}>+{SIGNALS.diff.added}</span>
          <span style={{ color:"var(--bad)" }}>−{SIGNALS.diff.removed}</span>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"24px 16px 1fr", fontSize:11.5, lineHeight:"19px" }}>
        {DIFF_LINES.map((d, i) => {
          const bg = d.kind === "add" ? "var(--add-bg)" : d.kind === "del" ? "var(--del-bg)" : "transparent";
          const sym = d.kind === "add" ? "+" : d.kind === "del" ? "−" : " ";
          const col = d.kind === "add" ? "var(--good)" : d.kind === "del" ? "var(--bad)" : "var(--ink-3)";
          return (
            <React.Fragment key={i}>
              <span className="mono" style={{ textAlign:"right", color:"var(--ink-3)", paddingRight:6, background:bg }}>{d.n}</span>
              <span className="mono" style={{ color:col, background:bg, textAlign:"center" }}>{sym}</span>
              <code className="mono" style={{ whiteSpace:"pre", overflow:"hidden", textOverflow:"ellipsis", background:bg, paddingRight:6 }}>{d.code}</code>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function CommunityCard() {
  return (
    <div className="card" style={{ padding:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
        <div className="cap">Community · {SIGNALS.vouches.toLocaleString()} vouches</div>
        <a className="mono" style={{ fontSize:11, color:"var(--ink-3)" }}>all reviews ↗</a>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {COMMUNITY.map((c, i) => (
          <div key={i} style={{ display:"flex", gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:6, background:"var(--line-2)",
                          color:"var(--ink-2)", display:"grid", placeItems:"center",
                          fontSize:11, fontWeight:600 }}>
              {c.who.replace("@","").slice(0,2).toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", gap:6, alignItems:"baseline", fontSize:12 }}>
                <span style={{ fontWeight:500 }}>{c.who}</span>
                {c.role.includes("verified") && (
                  <span className="pill pill--good" style={{ padding:"0 6px", fontSize:9.5 }}>verified</span>
                )}
                <span style={{ color:"var(--ink-3)", fontSize:11 }}>· {c.when}</span>
                <span style={{ marginLeft:"auto", color:"var(--good)", fontSize:11, display:"flex", alignItems:"center", gap:3 }}>
                  <Icon name="check" size={10} stroke={2.5}/>vouched
                </span>
              </div>
              <div style={{ fontSize:11.5, color:"var(--ink-2)", marginTop:3, lineHeight:1.45 }}>{c.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Source-bar (URL/raw/file) ──────────────────────────────────────────────

function CopyButton({ children = "Copy" }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button className="btn btn--ink"
            onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }}
            style={{ flex:"0 0 auto" }}>
      <Icon name={copied ? "check" : "file"} size={13} stroke={2.4}/>
      {copied ? "Copied" : children}
    </button>
  );
}

function PublicInstallCard({ slug = "nodefoundry", host = "safebash.dev",
                             source = "github", repo = "nodefoundry-dev/installer",
                             commit = "a7e391c", lastSync = "3h ago", publisher = "@nodefoundry-dev" }) {
  const url = `${host}/${slug}`;
  return (
    <div className="card" style={{ padding:0, overflow:"hidden" }}>
      <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span className="cap">Install command</span>
            <span className="pill pill--good" style={{ padding:"1px 7px", fontSize:10 }}>
              <Icon name="check" size={9} stroke={2.6}/>verified at this URL
            </span>
          </div>
          <span style={{ fontSize:11, color:"var(--ink-3)" }}>
            <span className="mono">{url}</span> · public
          </span>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"stretch" }}>
          <div style={{
            flex:1, display:"flex", alignItems:"center", gap:10, padding:"12px 16px",
            background:"var(--header-tint)", border:"1px solid var(--line)", borderRadius:8,
            fontFamily:"'JetBrains Mono', ui-monospace, monospace", fontSize:13.5, minWidth:0,
          }}>
            <span style={{ color:"var(--good)", fontWeight:600 }}>$</span>
            <span style={{ color:"var(--ink-3)" }}>curl -fsSL</span>
            <span style={{ color:"var(--ink)", fontWeight:500, whiteSpace:"nowrap",
                           overflow:"hidden", textOverflow:"ellipsis" }}>{url}</span>
            <span style={{ color:"var(--ink-3)" }}>| sh</span>
          </div>
          <CopyButton>Copy</CopyButton>
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:12,
                      color:"var(--ink-2)", lineHeight:1.55 }}>
          <Icon name="info" size={13} style={{ flex:"0 0 auto", marginTop:2, color:"var(--ink-3)" }}/>
          <div>
            One URL, two responses. <span style={{ color:"var(--ink)", fontWeight:500 }}>Browsers</span> get this audit page
            (<span className="mono">Accept: text/html</span>).{" "}
            <span style={{ color:"var(--ink)", fontWeight:500 }}>curl</span>,
            {" "}<span style={{ color:"var(--ink)", fontWeight:500 }}>wget</span>,
            and CI runners get the verified script (<span className="mono">text/x-shellscript</span>).
          </div>
        </div>
      </div>
      <hr className="hairline" />
      <div style={{ padding:"14px 20px", background:"var(--header-tint)",
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    flexWrap:"wrap", gap:12 }}>
        {source === "github" ? (
          <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:12.5, minWidth:0 }}>
            <span style={{ width:26, height:26, borderRadius:6, background:"var(--line-2)",
                           display:"grid", placeItems:"center", color:"var(--ink-2)", flex:"0 0 auto" }}>
              <Icon name="git" size={14}/>
            </span>
            <div style={{ minWidth:0 }}>
              <div style={{ color:"var(--ink-3)", fontSize:10.5, letterSpacing:".08em",
                            textTransform:"uppercase", marginBottom:2 }}>Source</div>
              <div style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                <span style={{ color:"var(--ink-3)" }}>Mirror of </span>
                <span className="mono" style={{ fontWeight:500 }}>github.com/{repo}</span>
                <span style={{ color:"var(--ink-3)" }}> · pinned </span>
                <span className="mono">{commit}</span>
                <span style={{ color:"var(--ink-3)" }}> · resyncs daily · last sync {lastSync}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:12.5 }}>
            <span style={{ width:26, height:26, borderRadius:6, background:"var(--line-2)",
                           display:"grid", placeItems:"center", color:"var(--ink-2)" }}>
              <Icon name="shield" size={14}/>
            </span>
            <div>
              <div style={{ color:"var(--ink-3)", fontSize:10.5, letterSpacing:".08em",
                            textTransform:"uppercase", marginBottom:2 }}>Source</div>
              <div>
                <span style={{ color:"var(--ink-3)" }}>Hosted on </span>
                <span style={{ fontWeight:500 }}>SafeBash</span>
                <span style={{ color:"var(--ink-3)" }}> · uploaded by </span>
                <span style={{ fontWeight:500 }}>{publisher}</span>
                <span style={{ color:"var(--ink-3)" }}> · edited 2d ago</span>
              </div>
            </div>
          </div>
        )}
        <div style={{ display:"flex", gap:6, flex:"0 0 auto" }}>
          {source === "github" && (
            <button className="btn" style={{ padding:"5px 10px", fontSize:11.5 }}>
              <Icon name="git" size={12}/>View on GitHub
            </button>
          )}
          <button className="btn" style={{ padding:"5px 10px", fontSize:11.5 }}>
            <Icon name="link" size={12}/>Share link
          </button>
        </div>
      </div>
    </div>
  );
}

function SourceBar() {
  return (
    <div className="card" style={{ padding:14, display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
      <div style={{ display:"flex", gap:0, background:"var(--line-2)", padding:3, borderRadius:7, fontSize:12 }}>
        {["URL", "Paste bash", "Upload .sh"].map((t, i) => (
          <div key={t} style={{
            padding:"5px 11px", borderRadius:5,
            background: i === 0 ? "var(--paper)" : "transparent",
            fontWeight: i === 0 ? 600 : 500,
            color: i === 0 ? "var(--ink)" : "var(--ink-3)",
            boxShadow: i === 0 ? "0 1px 2px rgba(0,0,0,.04)" : "none",
            display:"flex", alignItems:"center", gap:6,
          }}>
            <Icon name={i === 0 ? "link" : i === 1 ? "terminal" : "upload"} size={11.5}/>{t}
          </div>
        ))}
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, padding:"0 12px",
                    background:"var(--paper)", border:"1px solid var(--line)", borderRadius:7, height:34 }}>
        <span className="mono" style={{ fontSize:12, color:"var(--ink-3)" }}>curl -fsSL</span>
        <span className="mono" style={{ fontSize:12.5, fontWeight:500 }}>{SAMPLE_URL}</span>
        <span style={{ marginLeft:"auto", color:"var(--ink-3)", fontSize:11, display:"flex", alignItems:"center", gap:4 }}>
          <span className="dot" style={{ color:"var(--good)" }}></span>resolved · 200
        </span>
      </div>
      <button className="btn btn--ink"><Icon name="shield" size={13}/>Re-audit</button>
    </div>
  );
}

// ─── Composed Analyzer ──────────────────────────────────────────────────────

function TBAnalyzer({ onNav, dark }) {
  return (
    <div className={"tb" + (dark ? " dark" : "")} data-screen-label="A.1 · Analyzer (trust-bank)" style={{ width:"100%", height:"100%" }}>
      <TBHeader active="Library" onNav={onNav} />
      <div style={{ padding:"22px 28px 28px", display:"flex", flexDirection:"column", gap:18 }}>
        {/* breadcrumb / identity strip */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap:18 }}>
          <div style={{ minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"var(--ink-3)", marginBottom:8 }}>
              <a onClick={(e)=>{e.preventDefault(); onNav && onNav("Library");}}
                 style={{ cursor:"pointer", color:"var(--ink-3)" }}>Library</a>
              <span>/</span>
              <span style={{ color:"var(--ink-2)" }}>nodefoundry</span>
              <span>/</span>
              <span className="mono" style={{ color:"var(--ink)" }}>v2.4.1</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <h1 style={{ fontSize:26, margin:0, fontWeight:600, letterSpacing:"-0.02em" }}>
                nodefoundry
                <span style={{ color:"var(--ink-3)", fontWeight:400, fontSize:20 }}> · 2.4.1</span>
              </h1>
              <span className="pill pill--good"><Icon name="check" size={11} stroke={2.5}/>signed · cosign</span>
              <span className="pill"><Icon name="eye" size={11}/>public</span>
              <span className="pill"><Icon name="clock" size={11}/>audited 2d ago</span>
            </div>
            <div style={{ display:"flex", gap:14, marginTop:8, fontSize:11.5, color:"var(--ink-3)", flexWrap:"wrap" }}>
              <span className="mono">{SIGNALS.hash}</span>
              <span>·</span>
              <span>{SIGNALS.size} · {SIGNALS.lines} lines</span>
              <span>·</span>
              <span>diff vs {SIGNALS.diff.prevVersion}: +{SIGNALS.diff.added} −{SIGNALS.diff.removed}</span>
              <span>·</span>
              <span>34,219 installs this week</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn"><Icon name="diff" size={13}/>Compare versions</button>
            <button className="btn"><Icon name="upload" size={13}/>Export report</button>
          </div>
        </div>

        <PublicInstallCard />

        <div style={{ display:"grid", gridTemplateColumns:"1.55fr 1fr", gap:18 }}>
          {/* LEFT — code */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <AnnotatedCode />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <NetworkCard />
              <FilesCard />
            </div>
            <DiffCard />
          </div>
          {/* RIGHT — signals */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <VerdictCard />
            <IdentityCard />
            <ActionsCard />
            <CommunityCard />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Library screen ─────────────────────────────────────────────────────────

function VerdictPill({ verdict, score }) {
  const c = verdict === "trusted" ? "good" : verdict === "caution" ? "warn" : "bad";
  return (
    <span className={`pill pill--${c}`}>
      <span className="mono" style={{ fontWeight:600, fontVariantNumeric:"tabular-nums" }}>{score}</span>
      <span>{verdict}</span>
    </span>
  );
}

function HostBadge({ host, repo }) {
  if (host === "github") {
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11.5,
                      color:"var(--ink-2)", minWidth:0 }}>
        <span style={{ width:18, height:18, borderRadius:4, background:"var(--line-2)",
                       display:"grid", placeItems:"center", color:"var(--ink-2)", flex:"0 0 auto" }}>
          <Icon name="git" size={11}/>
        </span>
        <span className="mono" style={{ whiteSpace:"nowrap", overflow:"hidden",
                                          textOverflow:"ellipsis" }}>{repo}</span>
      </span>
    );
  }
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11.5, color:"var(--ink-2)" }}>
      <span style={{ width:18, height:18, borderRadius:4, background:"var(--line-2)",
                     display:"grid", placeItems:"center", color:"var(--good)", flex:"0 0 auto" }}>
        <Icon name="shield" size={11}/>
      </span>
      <span>SafeBash-hosted</span>
    </span>
  );
}

function TBLibrary({ onNav, onOpenScript, dark }) {
  const stats = [
    { k: "Public scripts",    v: "184" },
    { k: "GitHub-mirrored",   v: "126" },
    { k: "SafeBash-hosted",   v: "58" },
    { k: "Installs today",    v: "42,118", c:"var(--good)" },
  ];
  return (
    <div className={"tb" + (dark ? " dark" : "")} data-screen-label="A.2 · Library (trust-bank)" style={{ width:"100%", height:"100%" }}>
      <TBHeader active="Library" onNav={onNav} />
      <div style={{ padding:"22px 28px 28px", display:"flex", flexDirection:"column", gap:18 }}>
        {/* heading */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <h1 style={{ fontSize:26, margin:0, fontWeight:600, letterSpacing:"-0.02em" }}>Library</h1>
            <p style={{ color:"var(--ink-3)", fontSize:13.5, margin:"6px 0 0", maxWidth:560 }}>
              The public registry of audited install scripts. Each entry has a stable
              {" "}<span className="mono" style={{ color:"var(--ink-2)" }}>safebash.dev/&lt;name&gt;</span>
              {" "}URL that serves the audit page to browsers and the verified script to curl.
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn"><Icon name="sliders" size={13}/>Filters</button>
            <button className="btn btn--ink"><Icon name="plus" size={13}/>Publish a script</button>
          </div>
        </div>

        {/* stat row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {stats.map((s, i) => (
            <div key={i} className="card" style={{ padding:16 }}>
              <div className="cap" style={{ marginBottom:8 }}>{s.k}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <div style={{ fontSize:28, fontWeight:600, color:s.c || "var(--ink)", letterSpacing:"-0.02em", fontVariantNumeric:"tabular-nums" }}>{s.v}</div>
                {i === 0 && <span style={{ fontSize:11.5, color:"var(--ink-3)" }}>+4 this week</span>}
                {i === 1 && <span style={{ fontSize:11.5, color:"var(--ink-3)" }}>resyncs daily</span>}
                {i === 2 && <span style={{ fontSize:11.5, color:"var(--ink-3)" }}>signed by publisher</span>}
                {i === 3 && <span style={{ fontSize:11.5, color:"var(--good)" }}>+18% vs yesterday</span>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1.7fr 1fr", gap:18 }}>
          {/* main table */}
          <div className="card">
            {/* toolbar */}
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderBottom:"1px solid var(--line)" }}>
              <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, height:30, padding:"0 10px",
                            background:"var(--line-2)", borderRadius:7 }}>
                <Icon name="search" size={13}/>
                <span className="mono" style={{ fontSize:12, color:"var(--ink-3)" }}>publisher:* verdict:any version:latest</span>
                <span className="kbd" style={{ marginLeft:"auto" }}>⌘ K</span>
              </div>
              <div style={{ display:"flex", gap:4 }}>
                {["All","Trusted","Caution","Danger","GitHub","Hosted","Saved"].map((t,i) => (
                  <span key={t} style={{
                    padding:"5px 10px", borderRadius:6, fontSize:11.5, fontWeight:500,
                    color: i === 0 ? "var(--ink)" : "var(--ink-3)",
                    background: i === 0 ? "var(--line-2)" : "transparent", cursor:"default",
                  }}>{t}</span>
                ))}
              </div>
            </div>
            {/* head */}
            <div style={{ display:"grid", gridTemplateColumns:"34px 1.6fr 1.3fr 0.9fr 0.7fr 0.7fr 24px",
                          padding:"9px 16px", borderBottom:"1px solid var(--line)", background:"var(--header-tint)" }}>
              {["","Script & URL","Source","Verdict","Installs","Audited",""].map((h, i) => (
                <div key={i} className="cap" style={{ fontSize:10 }}>{h}</div>
              ))}
            </div>
            {/* rows */}
            {LIBRARY.map((row, i) => (
              <div key={i}
                   onClick={() => onOpenScript && onOpenScript(row)}
                   style={{
                display:"grid", gridTemplateColumns:"34px 1.6fr 1.3fr 0.9fr 0.7fr 0.7fr 24px",
                padding:"12px 16px", borderBottom: i === LIBRARY.length-1 ? "none" : "1px solid var(--line-2)",
                alignItems:"center", fontSize:12.5,
                background: row.current ? "var(--row-current)" : "transparent",
                cursor: "pointer",
              }}
                   onMouseEnter={(e) => { if (!row.current) e.currentTarget.style.background = "var(--line-2)"; }}
                   onMouseLeave={(e) => { if (!row.current) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ color:"var(--ink-3)", display:"flex", alignItems:"center" }}>
                  {row.current ? <Icon name="bolt" size={12} stroke={2}/> :
                   row.saved ? <Icon name="pin" size={11}/> : null}
                </span>
                <div style={{ minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
                    <span style={{ fontWeight:500, fontSize:13 }}>{row.name}</span>
                    <span className="mono" style={{ fontSize:11, color:"var(--ink-3)" }}>v{row.v}</span>
                    {row.current && <span className="pill pill--good" style={{ padding:"0 6px", fontSize:9.5 }}>current</span>}
                    {row.flagged && <span className="pill pill--bad" style={{ padding:"0 6px", fontSize:9.5 }}>flagged</span>}
                  </div>
                  <div className="mono" style={{ fontSize:11, color:"var(--ink-3)",
                                                   whiteSpace:"nowrap", overflow:"hidden",
                                                   textOverflow:"ellipsis" }}>
                    safebash.dev/{row.slug}
                  </div>
                </div>
                <HostBadge host={row.host} repo={row.repo} />
                <VerdictPill verdict={row.verdict} score={row.score} />
                <span className="mono" style={{ fontSize:11.5, color:"var(--ink-2)" }}>{row.installs}</span>
                <span style={{ color:"var(--ink-3)", fontSize:11.5 }}>{row.when}</span>
                <Icon name="chevron" size={12} stroke={1.8} />
              </div>
            ))}
          </div>

          {/* side panel: org policy + activity */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="card" style={{ padding:18 }}>
              <div className="cap" style={{ marginBottom:8 }}>Publish a script</div>
              <p style={{ fontSize:12.5, color:"var(--ink-2)", margin:"0 0 14px", lineHeight:1.5 }}>
                Two ways to give your script a stable, audited{" "}
                <span className="mono" style={{ color:"var(--ink-3)" }}>safebash.dev/&lt;name&gt;</span> URL.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start",
                              padding:12, border:"1px solid var(--line)", borderRadius:8,
                              background:"var(--header-tint)" }}>
                  <span style={{ width:28, height:28, borderRadius:6, background:"var(--paper)",
                                 border:"1px solid var(--line)",
                                 display:"grid", placeItems:"center", color:"var(--ink-2)", flex:"0 0 auto" }}>
                    <Icon name="git" size={14}/>
                  </span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12.5, fontWeight:600 }}>Link a GitHub repo</div>
                    <div style={{ fontSize:11.5, color:"var(--ink-3)", marginTop:2, lineHeight:1.45 }}>
                      Pin a commit or tag. SafeBash mirrors, re-audits on each push, and serves at your URL.
                    </div>
                  </div>
                  <button className="btn" style={{ padding:"4px 9px", fontSize:11 }}>
                    <Icon name="chevron" size={11}/>
                  </button>
                </div>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start",
                              padding:12, border:"1px solid var(--line)", borderRadius:8,
                              background:"var(--header-tint)" }}>
                  <span style={{ width:28, height:28, borderRadius:6, background:"var(--paper)",
                                 border:"1px solid var(--line)",
                                 display:"grid", placeItems:"center", color:"var(--good)", flex:"0 0 auto" }}>
                    <Icon name="shield" size={14}/>
                  </span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12.5, fontWeight:600 }}>Host on SafeBash</div>
                    <div style={{ fontSize:11.5, color:"var(--ink-3)", marginTop:2, lineHeight:1.45 }}>
                      Upload or paste bash. We sign, version, and serve it. No repo required.
                    </div>
                  </div>
                  <button className="btn" style={{ padding:"4px 9px", fontSize:11 }}>
                    <Icon name="chevron" size={11}/>
                  </button>
                </div>
              </div>
              <hr className="hairline" style={{ margin:"14px 0 12px" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11.5 }}>
                <span style={{ color:"var(--ink-3)" }}>Already published? Claim a script.</span>
                <a style={{ color:"var(--ink)", fontWeight:500, cursor:"pointer" }}>Claim →</a>
              </div>
            </div>

            <div className="card" style={{ padding:16 }}>
              <div className="cap" style={{ marginBottom:10 }}>Registry activity</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, fontSize:12 }}>
                {[
                  { ico:"check", c:"var(--good)", t:"nodefoundry 2.4.1 published",                 who:"@nodefoundry-dev · 2m ago" },
                  { ico:"git",   c:"var(--ink-2)", t:"rustup resynced from rust-lang/rustup",       who:"auto · 35m ago" },
                  { ico:"alert", c:"var(--warn)", t:"ollama 0.1.39 flagged: new sudo prompt",      who:"auto · 4h ago" },
                  { ico:"x",     c:"var(--bad)",  t:"fly-cli-rc removed: typosquat fly.io",        who:"moderation · 1d ago" },
                  { ico:"sparkle", c:"var(--ink-2)", t:"12 new community vouches",                  who:"governance · 1w ago" },
                ].map((a,i) => (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                    <div style={{ width:22, height:22, borderRadius:5, background:"var(--line-2)", color:a.c,
                                  display:"grid", placeItems:"center", flex:"0 0 auto" }}>
                      <Icon name={a.ico} size={11} stroke={2.2}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div>{a.t}</div>
                      <div style={{ color:"var(--ink-3)", fontSize:11, marginTop:2 }}>{a.who}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TBAnalyzer, TBLibrary });
