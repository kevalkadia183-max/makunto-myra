import fs from 'fs';

const oldContent = fs.readFileSync('artifacts/vox-console/index.html', 'utf-8');
const scriptMatch = oldContent.match(/(<script>[\s\S]*<\/script>)/);
if (!scriptMatch) {
  console.error("Could not find script block!");
  process.exit(1);
}
const oldScript = scriptMatch[1];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

:root {
  --bg: #000000;
  --panel: #111112;
  --panel-light: #1A1A1C;
  --accent: #FF3F00;
  --accent-dim: rgba(255, 63, 0, 0.15);
  --text: #FFFFFF;
  --text-dim: #888888;
  --text-muted: #555555;
  --border: rgba(255, 255, 255, 0.08);
  --border-light: rgba(255, 255, 255, 0.15);
  --green: #34C759;
  --green-dim: rgba(52, 199, 89, 0.15);
  --red: #FF3B30;
  --red-dim: rgba(255, 59, 48, 0.15);
}

* { box-sizing: border-box; }
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: 'Outfit', sans-serif;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Background Texture */
body::before {
  content: "";
  position: fixed; inset: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
  z-index: 0;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%);
}

.app-wrap {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  background: var(--bg);
  box-shadow: 0 0 40px rgba(0,0,0,0.8);
}

/* HEADER */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  position: relative;
  z-index: 60;
}
.brand {
  font-weight: 800;
  font-size: 20px;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #FFF, #888);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-dim);
}
.status-pill .dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--text-muted); transition: all 0.3s;
}
.status-pill .dot.live { background: var(--green); box-shadow: 0 0 10px var(--green); }
.status-pill .dot.err { background: var(--red); box-shadow: 0 0 10px var(--red); }

.settings-btn {
  background: none; border: none; padding: 4px; margin: -4px;
  color: var(--text-dim); cursor: pointer; transition: color 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.settings-btn:hover { color: var(--text); }
.settings-btn svg { width: 22px; height: 22px; }

/* SETTINGS PANEL */
.settings-panel {
  display: none;
  position: absolute;
  top: 70px; left: 16px; right: 16px;
  background: rgba(20, 20, 22, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-light);
  border-radius: 24px;
  padding: 24px;
  z-index: 100;
  box-shadow: 0 20px 40px rgba(0,0,0,0.8);
  transform-origin: top center;
  animation: scaleDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.settings-panel.open { display: block; }
@keyframes scaleDown { from { opacity: 0; transform: scale(0.95) translateY(-10px); } to { opacity: 1; transform: none; } }
.settings-panel h3 {
  font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 2px;
  color: var(--accent); margin: 0 0 20px; text-transform: uppercase;
}
.settings-row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px;
}
.settings-row:last-child { margin-bottom: 0; }
.settings-label {
  font-size: 13px; font-weight: 600; color: var(--text-dim); min-width: 80px;
}
.settings-select {
  flex: 1;
  background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border);
  color: var(--text); font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500;
  padding: 10px 14px; border-radius: 12px; outline: none; appearance: none;
}
.settings-select:focus { border-color: var(--accent); }
.settings-select option { background: var(--panel); }
.slider-wrap { flex: 1; display: flex; align-items: center; gap: 12px; }
.settings-slider {
  -webkit-appearance: none; appearance: none; flex: 1; height: 4px; border-radius: 2px;
  background: var(--border); outline: none; cursor: pointer;
}
.settings-slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%;
  background: var(--accent); cursor: pointer; box-shadow: 0 0 10px var(--accent-dim);
}
.slider-val {
  font-family: 'Space Mono', monospace; font-size: 12px; color: var(--accent); min-width: 32px; text-align: right; font-weight: 700;
}

/* CONTENT AREA */
.app-content {
  flex: 1;
  overflow-y: auto; overflow-x: hidden;
  position: relative;
  scrollbar-width: none; /* Firefox */
}
.app-content::-webkit-scrollbar { display: none; } /* Chrome */

.view {
  display: none; padding: 24px 20px 40px; animation: fadeIn 0.3s ease;
}
.view.active { display: block; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

/* TALK VIEW */
#viewTalk {
  height: 100%;
}
#viewTalk.active {
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 0 20px;
}
.stage {
  display: flex; flex-direction: column; align-items: center; margin-top: -40px;
}
.ring-wrap {
  position: relative; width: 280px; height: 280px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none;
}
canvas#scope {
  position: absolute; inset: 0; width: 100%; height: 100%;
  filter: drop-shadow(0 0 16px var(--accent-dim)) hue-rotate(-20deg) saturate(1.5);
}
.core {
  width: 100px; height: 100px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #1A0800, #0A0400 70%);
  border: 1px solid rgba(255, 63, 0, 0.4);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 13px; letter-spacing: 2px; color: var(--accent);
  text-align: center; line-height: 1.4;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 2;
  box-shadow: inset 0 4px 20px var(--accent-dim), 0 0 40px rgba(255, 63, 0, 0.1);
}
.core.listening {
  transform: scale(1.15);
  background: radial-gradient(circle at 35% 30%, var(--accent), #8A2200 70%);
  color: #FFF; border-color: var(--accent);
  box-shadow: 0 0 60px rgba(255, 63, 0, 0.6), inset 0 0 20px rgba(255,255,255,0.4);
}
.core.thinking {
  transform: scale(0.95);
  background: radial-gradient(circle at 35% 30%, #222, #0A0A0A 70%);
  color: var(--text-dim); border-color: var(--text-muted);
  box-shadow: none; animation: pulseCore 1.5s infinite;
}
@keyframes pulseCore { 0% { opacity: 0.8; } 50% { opacity: 1; border-color: #888; } 100% { opacity: 0.8; } }
.hint {
  margin-top: 32px; font-size: 13px; color: var(--text-muted); font-weight: 500;
  text-transform: uppercase; letter-spacing: 1px; text-align: center;
}
.latest-reply {
  margin-top: 40px; text-align: center; color: var(--text); font-size: 18px; font-weight: 500; line-height: 1.5;
  min-height: 24px; padding: 0 16px; max-width: 400px;
}
.latest-reply .who {
  display: block; font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 2px;
  color: var(--accent); margin-bottom: 12px; text-transform: uppercase;
}

/* DATA VIEWS */
.data-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.data-title { font-size: 22px; font-weight: 800; color: #FFF; letter-spacing: -0.5px; text-transform: uppercase; }
.data-actions { display: flex; gap: 8px; }
.mini-btn {
  background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text);
  font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px;
  padding: 8px 14px; border-radius: 100px; cursor: pointer; transition: all 0.2s; text-transform: uppercase;
}
.mini-btn:hover, .mini-btn:active { background: var(--accent); border-color: var(--accent); color: #FFF; }

.channel-card {
  background: linear-gradient(180deg, var(--panel-light), var(--panel));
  border: 1px solid var(--border); border-radius: 24px; padding: 20px; margin-bottom: 16px;
}
.channel-card .ch-head { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.channel-card img { width: 52px; height: 52px; border-radius: 16px; border: 1px solid var(--border-light); }
.ch-name { font-size: 18px; font-weight: 700; color: #FFF; margin-bottom: 2px; }
.ch-handle { font-family: 'Space Mono', monospace; font-size: 12px; color: var(--text-dim); }
.ch-badge {
  margin-left: auto; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
  padding: 4px 10px; border-radius: 100px; background: rgba(255,255,255,0.1); color: var(--text-dim);
}
.ch-badge.own { background: var(--green-dim); color: var(--green); }

.stat-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.stat {
  background: rgba(0,0,0,0.3); padding: 16px; border-radius: 16px; border: 1px solid var(--border);
}
.stat .lbl { display: block; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.stat .num { font-family: 'Space Mono', monospace; font-size: 22px; font-weight: 700; color: #FFF; display: flex; align-items: center; gap: 8px; }
.stat .delta { font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 6px; }
.delta.up { color: var(--green); background: var(--green-dim); }
.delta.down { color: var(--red); background: var(--red-dim); }

.video-list { margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px; display: flex; flex-direction: column; gap: 12px; }
.video-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.video-row .v-title { font-size: 14px; font-weight: 500; color: var(--text-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.video-row .v-views { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; color: #FFF; flex-shrink: 0; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; }

.setup-form { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.setup-input {
  flex: 1; min-width: 200px; background: rgba(0,0,0,0.4); border: 1px solid var(--border);
  color: #FFF; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500;
  padding: 14px 16px; border-radius: 16px; outline: none; transition: all 0.2s;
}
.setup-input:focus { border-color: var(--accent); background: rgba(255,63,0,0.05); }
.setup-note { font-size: 14px; color: var(--text-dim); line-height: 1.6; margin-top: 16px; }

.empty-mini { text-align: center; padding: 60px 20px; color: var(--text-muted); font-size: 14px; font-weight: 600; }

/* LOG VIEW */
.session-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
.session-label { font-size: 11px; font-weight: 800; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }
.session-select {
  flex: 1; background: rgba(255,255,255,0.05); border: none; color: #FFF;
  font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600;
  padding: 12px 16px; border-radius: 12px; outline: none; appearance: none;
}
.session-new-btn {
  background: var(--accent); color: #FFF; border: none; font-family: 'Outfit', sans-serif;
  font-size: 12px; font-weight: 800; letter-spacing: 1px; padding: 12px 16px; border-radius: 12px; cursor: pointer;
}
.log {
  display: flex; flex-direction: column; gap: 24px; padding-bottom: 80px; /* space for clear btn */
}
.entry { animation: fadeIn 0.3s ease; }
.entry .tag {
  font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  margin-bottom: 8px; display: block; text-transform: uppercase;
}
.entry.you .tag { color: var(--text-muted); }
.entry.vox .tag { color: var(--accent); }
.entry p { margin: 0; font-size: 16px; line-height: 1.6; font-weight: 400; }
.entry.you p { color: var(--text-dim); }
.entry.vox p { color: #FFF; font-weight: 500; }
.empty { text-align: center; padding: 80px 20px; color: var(--text-muted); font-size: 16px; line-height: 1.5; }

/* TABS / BOTTOM NAV */
.tabs {
  display: flex; justify-content: space-around;
  padding: 12px 16px env(safe-area-inset-bottom, 24px) 16px;
  background: rgba(10, 10, 12, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border); position: relative; z-index: 60;
}
.tab-btn {
  background: none; border: none; color: var(--text-muted);
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  font-family: 'Outfit', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1px;
  cursor: pointer; transition: all 0.2s; padding: 8px 12px;
}
.tab-btn svg { width: 24px; height: 24px; stroke-width: 2.2; transition: all 0.2s; }
.tab-btn:hover { color: var(--text-dim); }
.tab-btn.active { color: var(--accent); }
.tab-btn.active svg { transform: scale(1.1); stroke: var(--accent); }

/* MISC RE-LOCATED */
.log-footer {
  margin-top: 32px; border-top: 1px solid var(--border); padding-top: 24px; text-align: center;
}
.log-footer button {
  background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-dim);
  font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 10px 20px; border-radius: 100px;
  cursor: pointer; text-transform: uppercase; font-family: 'Outfit', sans-serif;
}
.log-footer button:hover { background: var(--border-light); color: #FFF; }
.engine-note {
  display: block; text-align: center; font-family: 'Space Mono', monospace; font-size: 10px;
  color: var(--text-muted); margin-top: 24px;
}
`;

const htmlHead = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<title>VOX — Voice Console</title>
<style>
${css}
</style>
</head>
<body>

<div class="app-wrap">
  <header class="app-header">
    <div class="brand">VOX</div>
    <div class="status-pill">
      <div class="dot" id="statusDot"></div>
      <span id="statusText">STANDBY</span>
    </div>
    <button class="settings-btn" id="settingsBtn" aria-label="Settings">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>
  </header>

  <div class="settings-panel" id="settingsPanel">
    <h3>Voice &amp; Language</h3>
    <div class="settings-row">
      <span class="settings-label">Language</span>
      <select class="settings-select" id="langSelect"></select>
    </div>
    <div class="settings-row">
      <span class="settings-label">Voice</span>
      <select class="settings-select" id="voiceSelect"></select>
    </div>
    <div class="settings-row">
      <span class="settings-label">Speed</span>
      <div class="slider-wrap">
        <input type="range" class="settings-slider" id="rateSlider" min="0.5" max="2" step="0.05">
        <span class="slider-val" id="rateVal">1.0</span>
      </div>
    </div>
    <div class="settings-row">
      <span class="settings-label">Pitch</span>
      <div class="slider-wrap">
        <input type="range" class="settings-slider" id="pitchSlider" min="0.5" max="2" step="0.05">
        <span class="slider-val" id="pitchVal">1.0</span>
      </div>
    </div>
  </div>

  <main class="app-content">
    <!-- TALK VIEW -->
    <div class="view active" id="viewTalk">
      <div class="stage">
        <div class="ring-wrap" id="ringWrap" title="Click and speak">
          <canvas id="scope" width="220" height="220"></canvas>
          <div class="core" id="core">TAP TO<br>SPEAK</div>
        </div>
        <div class="hint" id="hint">tap the ring and ask "how are we doing?"</div>
      </div>
      <div class="latest-reply" id="latestReply"></div>
    </div>

    <!-- DASHBOARD VIEW -->
    <div class="view" id="viewDashboard">
      <div class="data-head">
        <span class="data-title">DASHBOARD</span>
        <div class="data-actions">
          <button class="mini-btn" id="refreshReportBtn">Refresh</button>
          <button class="mini-btn" id="downloadReportBtn">CSV</button>
        </div>
      </div>
      <div id="reportArea"><div class="empty-mini">— loading —</div></div>
    </div>

    <!-- RADAR VIEW -->
    <div class="view" id="viewRadar">
      <div class="data-head">
        <span class="data-title">RADAR</span>
        <div class="data-actions">
          <button class="mini-btn" id="refreshTrendingBtn">Refresh</button>
        </div>
      </div>
      <div id="trendingArea"><div class="empty-mini">— loading —</div></div>
    </div>

    <!-- SETUP VIEW -->
    <div class="view" id="viewSetup">
      <div class="data-head"><span class="data-title">CHANNELS</span></div>
      <div class="setup-form">
        <input class="setup-input" id="channelInput" placeholder="@handle or youtube.com link" />
        <select class="settings-select" id="channelType" style="width:auto; flex:none;">
          <option value="own">My Channel</option>
          <option value="competitor">Competitor</option>
        </select>
        <button class="mini-btn" id="addChannelBtn">Add</button>
      </div>
      <div id="channelsArea"><div class="empty-mini">— no channels added yet —</div></div>
      <div class="setup-form" id="ytConnectRow" style="display:none; margin-top: 24px;">
        <button class="mini-btn" id="connectYtBtn" style="width:100%;">Connect YouTube (Private Data)</button>
      </div>
      <div class="setup-form" id="metaConnectRow" style="display:none;">
        <button class="mini-btn" id="connectMetaBtn" style="width:100%;">Connect Facebook / Instagram</button>
      </div>
      <div class="setup-note" id="setupNote">
        Add your YouTube channel handle to unlock voice answers about your stats, daily changes, and comparisons.
      </div>
      <span class="engine-note" id="engineNote">speech engine: checking…</span>
    </div>

    <!-- LOG VIEW -->
    <div class="view" id="viewLog">
      <div class="session-bar">
        <span class="session-label">Session</span>
        <select class="session-select" id="sessionSelect">
          <option value="">— new session —</option>
        </select>
        <button class="session-new-btn" id="newSessionBtn">+ New</button>
      </div>
      <div class="log" id="log">
        <div class="empty" id="emptyState">
          — no transmissions yet —<br><br>
          Talk to VOX and your conversation appears here.
        </div>
      </div>
      <div class="log-footer">
        <button id="clearBtn">Clear History</button>
      </div>
    </div>
  </main>

  <nav class="tabs">
    <button class="tab-btn active" data-view="viewTalk">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
      <span>TALK</span>
    </button>
    <button class="tab-btn" data-view="viewDashboard">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
      <span>DASH</span>
    </button>
    <button class="tab-btn" data-view="viewRadar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 12h4l2-9 5 18 3-9h6"></path></svg>
      <span>RADAR</span>
    </button>
    <button class="tab-btn" data-view="viewSetup">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      <span>SETUP</span>
    </button>
    <button class="tab-btn" data-view="viewLog">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      <span>LOG</span>
    </button>
  </nav>
</div>
`;

const finalHTML = htmlHead + "\n" + oldScript + "\n</body>\n</html>";
fs.writeFileSync('artifacts/vox-console/index.html', finalHTML);
console.log('Successfully updated index.html');
