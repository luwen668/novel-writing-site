// 文心织网 · 首页图谱
buildNodeMap();

// ---------- 打字机 ----------
(function typewriter() {
  const phrases = [
    "如何写一个让人过目不忘的开头？",
    "外貌描写，怎样避开“倾国倾城”？",
    "对话的高级感，藏在没说出口的话里。",
    "悬念不是藏着掖着，是刚刚好。",
    "删掉的那一段，往往是最好的修改。",
  ];
  const el = document.getElementById("typewriter");
  let p = 0, c = 0, deleting = false;
  function tick() {
    const text = phrases[p];
    if (!deleting) {
      el.textContent = text.slice(0, ++c);
      if (c === text.length) { deleting = true; return setTimeout(tick, 2100); }
      return setTimeout(tick, 90);
    }
    el.textContent = text.slice(0, --c);
    if (c === 0) { deleting = false; p = (p + 1) % phrases.length; return setTimeout(tick, 500); }
    setTimeout(tick, 32);
  }
  tick();
})();

// ---------- 节点数 ----------
document.getElementById("node-count").textContent = window.NODES.length;

// ---------- 水墨转场 ----------
const inkEl = document.getElementById("ink-transition");
const inkSeal = inkEl.querySelector(".ink-seal");
function inkTransitionTo(url) {
  inkEl.classList.add("play");
  const tl = gsap.timeline({ onComplete: () => { window.location.href = url; } });
  tl.to(inkEl, { clipPath: "circle(150% at 50% 50%)", duration: 0.55, ease: "power2.in" })
    .to(inkSeal, { opacity: 1, duration: 0.25 }, "-=0.15");
}

// ---------- 构建图谱 ----------
const chart = echarts.init(document.getElementById("graph"));
let activeFilter = -1;

function nodeSize(n) {
  const deg = n.links.length;
  return 26 + Math.min(deg * 3.5, 26);
}

function renderGraph() {
  const nodes = window.NODES
    .filter((n) => activeFilter === -1 || n.category === activeFilter)
    .map((n) => ({
      id: n.id,
      name: n.name,
      category: n.category,
      symbolSize: nodeSize(n),
      value: n.tagline,
      itemStyle: {
        color: PALETTE[n.category],
        borderColor: "rgba(245,239,227,0.95)",
        borderWidth: 2,
        shadowBlur: 12,
        shadowColor: "rgba(38,34,28,0.25)",
      },
      label: {
        show: true,
        fontSize: 12.5,
        fontFamily: "Noto Serif SC, Songti SC, serif",
        color: "#26221c",
        fontWeight: 600,
      },
    }));

  const linkSet = new Set();
  const links = [];
  window.NODES.forEach((n) => {
    if (activeFilter !== -1 && n.category !== activeFilter) return;
    n.links.forEach((t) => {
      const target = NODE_MAP[t];
      if (!target) return;
      if (activeFilter !== -1 && target.category !== activeFilter) return;
      const key = [n.id, t].sort().join("->");
      if (linkSet.has(key)) return;
      linkSet.add(key);
      links.push({ source: n.id, target: t });
    });
  });

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      backgroundColor: "rgba(38,34,28,0.92)",
      borderWidth: 0,
      textStyle: { color: "#f5efe3", fontFamily: "Noto Serif SC, serif", fontSize: 13 },
      formatter(p) {
        if (p.dataType !== "node") return "";
        return `<b style="font-size:15px">${p.data.name}</b><br/>${NODE_MAP[p.data.id].summary}`;
      },
    },
    series: [{
      type: "graph",
      layout: "force",
      roam: true,
      draggable: true,
      zoom: 0.85,
      layoutCenter: ["50%", "50%"],
      layoutSize: "80%",
      force: {
        repulsion: 380,
        edgeLength: [70, 150],
        gravity: 0.16,
        friction: 0.3,
      },
      emphasis: {
        focus: "adjacency",
        label: { fontSize: 14 },
        lineStyle: { width: 2.5 },
      },
      lineStyle: {
        color: "rgba(38,34,28,0.28)",
        width: 1.2,
        curveness: 0.08,
      },
      data: nodes,
      links,
    }],
  }, true);
}

chart.on("click", (params) => {
  if (params.dataType === "node") {
    inkTransitionTo("node.html?id=" + encodeURIComponent(params.data.id));
  }
});

// ---------- 分类筛选 ----------
const bar = document.getElementById("filter-bar");
const allChip = document.createElement("button");
allChip.className = "filter-chip active";
allChip.textContent = "全部";
allChip.onclick = () => select(-1);
bar.appendChild(allChip);
CATEGORIES.forEach((cat, i) => {
  const chip = document.createElement("button");
  chip.className = "filter-chip";
  chip.textContent = cat;
  chip.style.setProperty("--cat-color", PALETTE[i]);
  chip.onclick = () => select(i);
  bar.appendChild(chip);
});
function select(i) {
  activeFilter = i;
  bar.querySelectorAll(".filter-chip").forEach((c, idx) => {
    c.classList.toggle("active", (idx === 0 && i === -1) || idx - 1 === i);
  });
  renderGraph();
}

// ---------- Hero 入场动画 ----------
gsap.from(".hero-main > *", { opacity: 0, y: 26, duration: 0.8, stagger: 0.12, ease: "power3.out" });
gsap.from(".hero-seal", { opacity: 0, scale: 0.6, rotate: 20, duration: 0.9, delay: 0.4, ease: "back.out(1.8)" });
gsap.from(".hero-vertical", { opacity: 0, y: -20, duration: 1, delay: 0.3 });

renderGraph();
window.addEventListener("resize", () => chart.resize());
