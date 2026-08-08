// Makunto Myra — account sign-in (Clerk). Login is REQUIRED: signed-out
// visitors see a blocking sign-in overlay and cannot use any page until
// they sign in. (Server-side, every protected endpoint also returns 401.)
// Loaded as a Vite module so import.meta.env works; the main app talks to it
// through the window.MyraAuth bridge.
import { Clerk } from "@clerk/clerk-js";
import { publishableKeyFromHost } from "@clerk/shared/keys";

// Resolve the key from the hostname so the same build can serve custom
// domains; falls back to the provisioned key. Proxy URL is empty in dev
// (intentional) and auto-populated in production — no env gating.
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const appearance = {
  variables: {
    colorPrimary: "#8b5cf6",
    colorBackground: "#16131f",
    colorForeground: "#f2f0f7",
    colorMutedForeground: "#8884a3",
    colorInput: "#211c2e",
    colorInputForeground: "#f2f0f7",
    colorNeutral: "#f2f0f7",
    colorDanger: "#f87171",
    borderRadius: "14px",
    fontFamily: "'Inter', sans-serif",
  },
  elements: {
    rootBox: { width: "100%", display: "flex", justifyContent: "center" },
    cardBox: { background: "#16131f", width: "min(440px, 94vw)", borderRadius: "20px", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" },
    card: { boxShadow: "none", border: "0", background: "transparent" },
    footer: { boxShadow: "none", border: "0", background: "transparent" },
    headerTitle: { color: "#ffffff" },
    headerSubtitle: { color: "#8884a3" },
    socialButtonsBlockButton: { background: "#211c2e", border: "1px solid rgba(139,92,246,0.3)" },
    socialButtonsBlockButtonText: { color: "#f2f0f7" },
    formFieldLabel: { color: "#b9b6c9" },
    formButtonPrimary: { background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#ffffff" },
    footerActionText: { color: "#8884a3" },
    footerActionLink: { color: "#a78bfa" },
    dividerText: { color: "#8884a3" },
    dividerLine: { background: "rgba(255,255,255,0.12)" },
    formFieldInput: { background: "#211c2e", color: "#f2f0f7", border: "1px solid rgba(255,255,255,0.12)" },
    otpCodeFieldInput: { background: "#211c2e", color: "#f2f0f7" },
    identityPreviewEditButton: { color: "#a78bfa" },
    formFieldSuccessText: { color: "#34d399" },
    alert: { background: "#211c2e" },
    alertText: { color: "#f2f0f7" },
  },
};

const clerk = new Clerk(clerkPubKey, clerkProxyUrl ? { proxyUrl: clerkProxyUrl } : undefined);

const listeners = [];
let overlayEl = null;
let mounted = false;
let loaded = false; // clerk.load() resolved — mounting UI before this throws
let wantOverlay = false; // someone asked for the overlay before Clerk finished loading

function ensureOverlay() {
  if (overlayEl) return overlayEl;
  overlayEl = document.createElement("div");
  overlayEl.id = "authOverlay";
  overlayEl.style.cssText =
    "position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;" +
    "background:rgba(8,6,14,0.94);backdrop-filter:blur(6px);padding:16px;overflow:auto;gap:18px;";
  const brand = document.createElement("div");
  brand.textContent = "MYRA";
  brand.style.cssText = "color:#a78bfa;font-weight:800;letter-spacing:6px;font-size:20px;";
  overlayEl.appendChild(brand);
  const inner = document.createElement("div");
  inner.id = "authMount";
  inner.style.cssText = "width:100%;display:flex;justify-content:center;";
  inner.textContent = "Loading sign in…";
  overlayEl.appendChild(inner);
  document.body.appendChild(overlayEl);
  return overlayEl;
}

function hide() {
  if (!overlayEl) return;
  if (mounted) {
    try { clerk.unmountSignIn(document.getElementById("authMount")); } catch (e) { /* not mounted */ }
    mounted = false;
  }
  overlayEl.remove();
  overlayEl = null;
}

let mountRetryTimer = null;
function show() {
  wantOverlay = true;
  const overlay = ensureOverlay();
  if (!loaded || mounted) return; // mount happens when load() resolves
  const target = overlay.querySelector("#authMount");
  try {
    target.textContent = "";
    clerk.mountSignIn(target, {
      appearance,
      // Hash routing keeps everything (including the Google OAuth callback)
      // on this single page — no dedicated routes needed.
      routing: "hash",
      withSignUp: true,
    });
    mounted = true;
    if (mountRetryTimer) { clearTimeout(mountRetryTimer); mountRetryTimer = null; }
  } catch (err) {
    // Clerk's UI components load in a separate lazy chunk that may not be
    // ready the instant load() resolves — retry until it is.
    console.warn("Sign-in card not ready yet, retrying…", err);
    target.textContent = "Loading sign in…";
    if (!mountRetryTimer) {
      mountRetryTimer = setTimeout(() => {
        mountRetryTimer = null;
        if (wantOverlay && !mounted) show();
      }, 600);
    }
  }
}

function currentUser() {
  const u = clerk.user;
  if (!u) return null;
  return {
    id: u.id,
    email: u.primaryEmailAddress ? u.primaryEmailAddress.emailAddress : "",
    name: u.fullName || u.firstName || "",
    imageUrl: u.imageUrl || "",
  };
}

function notify() {
  const user = currentUser();
  // Login is required: keep the overlay up whenever there is no user.
  if (user) { wantOverlay = false; hide(); }
  else show();
  listeners.forEach((fn) => { try { fn(user); } catch (e) { console.error(e); } });
}

window.MyraAuth = {
  ready: false,
  openSignIn: show,
  getUser: currentUser,
  signOut: () => clerk.signOut().then(() => { notify(); }),
  onChange: (fn) => { listeners.push(fn); if (window.MyraAuth.ready) fn(currentUser()); },
};

// Show the gate immediately so no page is usable while Clerk loads.
show();

clerk
  .load({ appearance })
  .then(() => {
    loaded = true;
    window.MyraAuth.ready = true;
    clerk.addListener(() => notify());
    if (wantOverlay && !clerk.user) show(); // mount the real sign-in card now
    notify();
  })
  .catch((err) => {
    console.error("Auth failed to load:", err);
    const target = document.getElementById("authMount");
    if (target) target.innerHTML =
      '<div style="color:#f2f0f7;text-align:center;max-width:320px;line-height:1.5;">' +
      "Couldn't load sign in. Please check your connection and " +
      '<a href="javascript:location.reload()" style="color:#a78bfa;">reload the page</a>.</div>';
  });
