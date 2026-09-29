// 文心织网 · 知识点详情页
buildNodeMap();
gsap.registerPlugin(ScrollTrigger);

const id = new URLSearchParams(location.search).get("id");
const node = NODE_MAP[id];
const root = document.getElementById("node-detail");

// ---------- 阅读进度条 ----------
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const pct = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
  document.getElementById("reading-progress").style.width = (pct * 100) + "%";
});

// ---------- 水墨进场 ----------
const inkEl = document.getElementById("ink-transition");
const inkSeal = inkEl.querySelector(".ink-seal");
if (node) inkSeal.textContent = node.name.slice(0, 1);
gsap.set(inkEl, { clipPath: "circle(150% at 50% 50%)" });
inkEl.classList.add("play");
gsap.to(inkSeal, { opacity: 1, duration: 0.3, delay: 0.1 });
gsap.to(inkEl, { clipPath: "circle(0% at 50% 50%)", duration: 0.7, delay: 0.45, ease: "power2.out", onComplete: () => inkEl.classList.remove("play") });

// ---------- 相关卡片点击也走水墨转场 ----------
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-ink]");
  if (!a) return;
  e.preventDefault();
  inkEl.classList.add("play");
  gsap.set(inkEl, { clipPath: "circle(0% at 50% 50%)" });
  const tl = gsap.timeline({ onComplete: () => { window.location.href = a.href; } });
  tl.to(inkEl, { clipPath: "circle(150% at 50% 50%)", duration: 0.5, ease: "power2.in" })
    .to(inkSeal, { opacity: 1, duration: 0.2 }, "-=0.15");
});

// ---------- 渲染 ----------
if (!node) {
  document.title = "未找到 · 文心织网";
  root.innerHTML = `
    <div class="notfound">
      <h1>查无此篇</h1>
      <p>这个知识点不存在或已被移出图谱。</p>
      <a class="filter-chip" style="display:inline-block" href="index.html">返回图谱</a>
    </div>`;
} else {
  const catName = CATEGORIES[node.category];
  const catColor = PALETTE[node.category];
  document.title = node.name + " · " + catName + " · 文心织网";

  const related = node.links
    .map((t) => NODE_MAP[t])
    .filter(Boolean);

  root.innerHTML = `
    <header class="detail-hero" style="--cat-color:${catColor}">
      <p class="detail-crumb">
        <span class="crumb-seal">${catName}</span>
        <span>卷${["一","二","三","四","五","六","七","八","九"][node.category]} · 之${node.name.length <= 4 ? ["壹","贰","叁","肆","伍","陆","柒","捌","玖","拾"][Math.max(0, node.name.length - 2)] : "篇"}</span>
      </p>
      <h1 class="detail-title">${node.name}</h1>
      <p class="detail-tagline">${node.tagline}</p>
      <div class="detail-rule"><span>品读</span></div>
    </header>
    <article class="detail-body" style="--cat-color:${catColor}">
      ${node.content}
    </article>
    <section class="related-section">
      <h2 class="related-title">— 举一反三 · 相关知识点 —</h2>
      <div class="related-grid">
        ${related.map((r) => `
          <a class="related-card gs-reveal" style="--cat-color:${PALETTE[r.category]}" data-ink href="node.html?id=${encodeURIComponent(r.id)}">
            <span class="rel-cat">${CATEGORIES[r.category]}</span>
            <div class="rel-name">${r.name}</div>
            <div class="rel-tag">${r.tagline}</div>
          </a>`).join("")}
      </div>
    </section>`;

  // 滚动渐入动画
  gsap.utils.toArray(".detail-body > *, .related-card").forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 26 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
  });
  gsap.from(".detail-hero > *", { opacity: 0, y: 20, duration: 0.7, stagger: 0.1, delay: 0.7, ease: "power3.out" });
}
