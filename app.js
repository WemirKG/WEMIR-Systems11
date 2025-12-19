/* WEMIR SOLUTIONS – interactivity (no external libs) */

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const TOOLS = [
  { id:"ai-chat", name:"AI Chat Concierge", tag:"Support", icon:"💬",
    desc:"On-site assistant to answer FAQs, route leads, and reduce repetitive questions." },
  { id:"lead-quiz", name:"AI Lead Magnet Quiz", tag:"Conversion", icon:"🧲",
    desc:"Interactive quiz that recommends a plan and captures email/phone with high intent." },
  { id:"copy-polish", name:"AI Copy Polish", tag:"Authority", icon:"✍️",
    desc:"Upgrade your headlines/CTAs with on-brand copy variations (safe + measurable)." },
  { id:"package-reco", name:"Package Recommender", tag:"Sales", icon:"🧠",
    desc:"Visitors answer 3–5 questions and get the best package recommendation instantly." },
  { id:"smart-form", name:"Smart Intake Form", tag:"Automation", icon:"🧾",
    desc:"Form that structures requests cleanly and generates summaries for faster follow-up." },
  { id:"mini-canvas", name:"Canvas Micro-Experience", tag:"Engagement", icon:"🎛️",
    desc:"A premium interactive section (canvas animation / mini module) that keeps attention." }
];

const FAQ = [
  {
    q: "Is it really $200 for 2 tools?",
    a: "Yes. The core offer is a flat $200 for two integrations from the list. If your site requires major refactoring or a new backend, we’ll quote that separately before any work starts."
  },
  {
    q: "What platforms do you support?",
    a: "Most common websites: static sites (GitHub Pages), WordPress, Webflow, Shopify (theme-level enhancements), and custom HTML/CSS/JS. If you can share your URL, we’ll confirm compatibility quickly."
  },
  {
    q: "Do you need my passwords?",
    a: "Not by default. We prefer safe workflows: staging environments, limited-access collaborator roles, or you deploying the final code we provide. We’ll propose the least-risk method."
  },
  {
    q: "What if I don’t know which tools to pick?",
    a: "Use the intake form. We’ll recommend the best two tools based on your goal (leads, sales, support reduction, engagement, premium look)."
  },
  {
    q: "Can you make it fully automated like an AI generator platform later?",
    a: "Yes. This site is designed to monetize now. When you’re ready, we can evolve it into a pipeline (payment → job queue → AI generation → delivery). That’s a separate build with infrastructure and ongoing ops."
  }
];

const state = {
  selected: new Set(),
  payUrl: "https://paypal.me/YOURPAYPALNAME/200" // replace with your PayPal.me or Stripe payment link
};

/* Smooth scroll */
$$("[data-scroll]").forEach(btn=>{
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-scroll");
    const el = $(target);
    if (el) el.scrollIntoView({behavior:"smooth", block:"start"});
  });
});

/* Modals */
function openModal(id){
  const m = document.getElementById(id);
  if (!m) return;
  m.hidden = false;
  document.body.style.overflow = "hidden";
  m.querySelector("button, a, input, textarea, select")?.focus();
}
function closeModal(id){
  const m = document.getElementById(id);
  if (!m) return;
  m.hidden = true;
  document.body.style.overflow = "";
}
$$("[data-open]").forEach(el=>{
  el.addEventListener("click", ()=> openModal(el.getAttribute("data-open")));
});
$$("[data-close]").forEach(el=>{
  el.addEventListener("click", ()=> closeModal(el.getAttribute("data-close")));
});
document.addEventListener("keydown",(e)=>{
  if (e.key === "Escape") {
    $$(".modal").forEach(m => { if(!m.hidden) closeModal(m.id); });
  }
});

/* Reveal animations */
const io = new IntersectionObserver((entries)=>{
  for (const ent of entries){
    if (ent.isIntersecting) ent.target.classList.add("in");
  }
},{threshold:.15});
$$(".reveal").forEach(el => io.observe(el));

/* Year */
$("#year").textContent = String(new Date().getFullYear());

/* Tools grid */
const toolGrid = $("#toolGrid");
const picked = $("#picked");
const pickCount = $("#pickCount");
const checkoutBtn = $("#checkoutBtn");
const siteUrl = $("#siteUrl");
const notes = $("#notes");
const goal = $("#goal");
const priceEl = $("#price");
const payLink = $("#payLink");
const checkoutSummary = $("#checkoutSummary");

function renderTools(){
  toolGrid.innerHTML = "";
  TOOLS.forEach(t=>{
    const div = document.createElement("div");
    div.className = "tool";
    div.setAttribute("role","button");
    div.setAttribute("tabindex","0");
    div.dataset.id = t.id;

    div.innerHTML = `
      <div class="tool-top">
        <div class="name">${t.name}</div>
        <div class="tag">${t.tag}</div>
      </div>
      <p class="desc">${t.desc}</p>
      <div class="spark" aria-hidden="true"></div>
    `;

    const toggle = () => toggleTool(t.id);
    div.addEventListener("click", toggle);
    div.addEventListener("keydown", (e)=>{ if(e.key==="Enter"||e.key===" ") toggle(); });

    toolGrid.appendChild(div);
  });
}

function toggleTool(id){
  const max = 2;
  if (state.selected.has(id)) state.selected.delete(id);
  else {
    if (state.selected.size >= max) {
      // simple “soft block”
      pulseSummary("Pick 2 tools max");
      return;
    }
    state.selected.add(id);
  }
  syncUI();
}

function pulseSummary(msg){
  pickCount.textContent = msg;
  pickCount.style.opacity = "1";
  setTimeout(()=>syncPickLabel(), 900);
}

function syncPickLabel(){
  const n = state.selected.size;
  pickCount.textContent = n === 0 ? "Pick 2 tools" : (n === 1 ? "Pick 1 more tool" : "2 tools selected");
}

function syncUI(){
  // tool card states
  $$(".tool").forEach(card=>{
    const id = card.dataset.id;
    card.classList.toggle("selected", state.selected.has(id));
  });

  // picked pills
  picked.innerHTML = "";
  const ids = Array.from(state.selected);
  ids.forEach(id=>{
    const t = TOOLS.find(x=>x.id===id);
    const pill = document.createElement("div");
    pill.className = "pillpick";
    pill.innerHTML = `
      <div class="left">
        <div class="icon" aria-hidden="true">${t.icon}</div>
        <div>
          <div style="font-weight:800">${t.name}</div>
          <div style="font-size:12px;color:rgba(255,255,255,.65)">${t.tag}</div>
        </div>
      </div>
      <button class="x" aria-label="Remove ${t.name}">×</button>
    `;
    pill.querySelector(".x").addEventListener("click", ()=>toggleTool(id));
    picked.appendChild(pill);
  });

  syncPickLabel();

  // checkout enabled when 2 selected and URL valid
  const urlOk = (siteUrl.value || "").trim().length > 6;
  checkoutBtn.disabled = !(state.selected.size === 2 && urlOk);

  // price stays flat now; keep hook for future tiers
  priceEl.textContent = "200";
  payLink.href = state.payUrl;
}

renderTools();

/* URL input validation for enabling checkout */
siteUrl.addEventListener("input", syncUI);

/* Checkout modal */
checkoutBtn.addEventListener("click", ()=>{
  const selected = Array.from(state.selected).map(id => TOOLS.find(t=>t.id===id));
  const url = (siteUrl.value || "").trim();
  const g = goal.value;
  const n = (notes.value || "").trim();

  checkoutSummary.innerHTML = `
    <div style="font-weight:900; font-size:14px; margin-bottom:8px;">Order Summary</div>
    <div style="display:grid; gap:8px;">
      <div><span style="opacity:.7">Website:</span> <span style="font-weight:700">${escapeHtml(url)}</span></div>
      <div><span style="opacity:.7">Goal:</span> <span style="font-weight:700">${escapeHtml(g)}</span></div>
      <div><span style="opacity:.7">Tools:</span>
        <ul style="margin:6px 0 0; padding-left:18px; color:rgba(255,255,255,.78);">
          <li>${escapeHtml(selected[0].name)}</li>
          <li>${escapeHtml(selected[1].name)}</li>
        </ul>
      </div>
      ${n ? `<div><span style="opacity:.7">Notes:</span><div style="margin-top:6px; color:rgba(255,255,255,.78); line-height:1.6;">${escapeHtml(n)}</div></div>` : ""}
      <div style="margin-top:6px; padding-top:10px; border-top:1px solid rgba(255,255,255,.08); display:flex; justify-content:space-between;">
        <span style="opacity:.7">Total</span>
        <span style="font-weight:900">$200</span>
      </div>
    </div>
  `;

  openModal("modal-checkout");
});

/* Intake form → mailto handoff (safe default) */
$("#intakeForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get("name");
  const email = fd.get("email");
  const url = fd.get("url");
  const message = fd.get("message");
  const industry = fd.get("industry");
  const deadline = fd.get("deadline");

  const subject = encodeURIComponent("WEMIR SOLUTIONS — Upgrade Intake");
  const body = encodeURIComponent(
`Name: ${name}
Email: ${email}
Website: ${url}
Industry: ${industry || "-"}
Deadline: ${deadline || "-"}

Message:
${message}
`
  );

  // Replace with your business email
  window.location.href = `mailto:YOURBUSINESSEMAIL@domain.com?subject=${subject}&body=${body}`;
  closeModal("modal-intake");
});

/* FAQ render */
const faqList = $("#faqList");
FAQ.forEach((item, i)=>{
  const wrap = document.createElement("div");
  wrap.className = "faq-item";
  wrap.innerHTML = `
    <button class="faq-q" aria-expanded="false">
      <span>${item.q}</span>
      <span class="faq-icon">+</span>
    </button>
    <div class="faq-a" hidden>${item.a}</div>
  `;
  const btn = $(".faq-q", wrap);
  const ans = $(".faq-a", wrap);
  const icon = $(".faq-icon", wrap);

  btn.addEventListener("click", ()=>{
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    ans.hidden = open;
    icon.textContent = open ? "+" : "–";
  });

  faqList.appendChild(wrap);
});

/* Terminal typing effect */
const term = $("#term");
const lines = [
  "$ wemir upgrade --site https://yourwebsite.com --tools 2",
  "Scanning stack...  ✔ static/wordpress/webflow/shopify-compatible checks",
  "Selecting tools...  ✔ matched to goal (leads/sales/support/engagement)",
  "Installing UI module...  ✔ on-brand styling + mobile-first layout",
  "Securing keys...  ✔ env vars + server-side proxy when needed",
  "QA pass...          ✔ performance + accessibility + responsiveness",
  "Deploying...        ✔ live + tested",
  "",
  "Result: Your site feels alive — and it converts."
];

let cursor = 0;
let row = 0;

function typeTick(){
  if (!term) return;
  if (row >= lines.length) return;

  const line = lines[row];
  if (cursor <= line.length){
    const before = lines.slice(0, row).join("\n");
    const current = line.slice(0, cursor);
    const caret = (cursor % 2 === 0) ? "▌" : " ";
    term.textContent = before + (before ? "\n" : "") + current + caret;
    cursor++;
    setTimeout(typeTick, 18 + Math.random()*22);
  } else {
    cursor = 0;
    row++;
    setTimeout(typeTick, 260);
  }
}
typeTick();

/* Mock metric drift */
function driftMetric(id, min, max, step=1){
  const el = document.getElementById(id);
  if(!el) return;
  const v = parseFloat(el.textContent);
  const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.random()*step);
  const next = Math.max(min, Math.min(max, v + delta));
  el.textContent = (id==="mTime") ? next.toFixed(1) : Math.round(next);
}
setInterval(()=>{
  driftMetric("mEng", 12, 34, 1.4);
  driftMetric("mLeads", 10, 46, 2.0);
  driftMetric("mTime", 2.5, 12.0, 0.6);
}, 1400);

/* Particles canvas */
const canvas = $("#particles");
const ctx = canvas.getContext("2d");
let W=0, H=0, DPR=1;
let pts = [];

function resize(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = canvas.width = Math.floor(window.innerWidth * DPR);
  H = canvas.height = Math.floor(window.innerHeight * DPR);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  pts = Array.from({length: Math.min(120, Math.floor((window.innerWidth*window.innerHeight)/14000))}, ()=>({
    x: Math.random()*W,
    y: Math.random()*H,
    vx: (Math.random()-.5)*0.22*DPR,
    vy: (Math.random()-.5)*0.22*DPR,
    r: (1 + Math.random()*2.2)*DPR
  }));
}
window.addEventListener("resize", resize, {passive:true});
resize();

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.globalAlpha = 0.9;

  // points
  for (const p of pts){
    p.x += p.vx; p.y += p.vy;
    if (p.x<0||p.x>W) p.vx *= -1;
    if (p.y<0||p.y>H) p.vy *= -1;

    const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6);
    g.addColorStop(0, "rgba(124,58,237,0.22)");
    g.addColorStop(0.5,"rgba(6,182,212,0.14)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r*6,0,Math.PI*2);
    ctx.fill();
  }

  // links
  ctx.globalAlpha = 0.35;
  for (let i=0;i<pts.length;i++){
    for (let j=i+1;j<pts.length;j++){
      const a=pts[i], b=pts[j];
      const dx=a.x-b.x, dy=a.y-b.y;
      const d2 = dx*dx+dy*dy;
      const max = (140*DPR)*(140*DPR);
      if (d2 < max){
        const t = 1 - d2/max;
        ctx.strokeStyle = `rgba(245,158,11,${0.12*t})`;
        ctx.lineWidth = 1*DPR;
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}
draw();

/* Helpers */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}

/* Initialize UI */
syncUI();
