const fs = require("fs");

async function j(u) {
  const r = await fetch(u, {
    headers: { "User-Agent": "spinstorm", Authorization: process.env.GH_TOKEN && u.includes("api.github.com") ? "Bearer " + process.env.GH_TOKEN : undefined }
  });
  if (!r.ok) throw new Error(u + " " + r.status);
  return r.json();
}

async function hn() {
  const ids = (await j("https://hacker-news.firebaseio.com/v0/showstories.json")).slice(0, 25);
  const items = await Promise.all(ids.map(id => j("https://hacker-news.firebaseio.com/v0/item/" + id + ".json")));
  return items.filter(i => i && i.title).map(i => ({
    title: i.title.replace(/^Show HN:\s*/i, ""),
    source: "Hacker News",
    url: "https://news.ycombinator.com/item?id=" + i.id,
    score: i.score || 0
  }));
}

async function gh() {
  const d = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const r = await j("https://api.github.com/search/repositories?q=created:>" + d + "&sort=stars&order=desc&per_page=25");
  return r.items.filter(x => x.description).map(x => ({
    title: x.description,
    source: "GitHub",
    url: x.html_url,
    score: x.stargazers_count
  }));
}

async function dev() {
  const r = await j("https://dev.to/api/articles?tag=showdev&top=7&per_page=25");
  return r.map(a => ({
    title: a.title.replace(/^Show DEV:\s*/i, ""),
    source: "dev.to",
    url: a.url,
    score: a.public_reactions_count || 0
  }));
}                                                   }
const ACR = { ai: 1, api: 1, cli: 1, sql: 1, sdk: 1, llm: 1, gpt: 1, rag: 1 };
const CATS = [
  { k: /\b(editor|terminal|cli|compiler|debugger|git|api|sdk|database|sql|framework|devtools?)\b/i,
    p: ["A friendlier {k} for beginners", "Learn {k} in 10 minutes a day", "A simpler {k} explainer"],
    a: ["students", "self-taught developers", "bootcamp grads", "junior developers", "hobbyists"] },
  { k: /\b(ai|llm|gpt|agents?|chatbots?|rag|model)\b/i,
    p: ["Plain-English {k} for non-experts", "A daily {k} tip in your pocket", "{k} tricks for everyday jobs"],
    a: ["teachers", "small shops", "students", "freelancers", "office workers"] },
  { k: /\b(budget|invoice|expense|tax|payment|savings?|money|finance|pricing)\b/i,
    p: ["Dead-simple {k} tracking", "{k} help over a single screen", "A friendlier way to handle {k}"],
    a: ["freelancers", "street vendors", "small shops", "students", "couples"] },
  { k: /\b(habit|sleep|workout|fitness|meditation|diet|mood|health|walking|running)\b/i,
    p: ["A tiny {k} tracker you actually use", "{k} check-ins in 10 seconds", "A kinder way to stick to {k}"],
    a: ["night-shift workers", "new parents", "beginners", "office workers", "retirees"] },
  { k: /\b(learn\w*|course|tutorial|flashcards?|study|language|teach\w*|quiz)\b/i,
    p: ["Bite-sized {k} on your phone", "A {k} buddy that keeps you going", "{k} made social"],
    a: ["students", "travelers", "immigrants", "job seekers", "teachers"] },
  { k: /\b(todo|tasks?|notes?|calendar|schedule|reminders?|planner|focus|timer)\b/i,
    p: ["A one-screen {k} app", "{k} that nags you politely", "A calmer way to manage {k}"],
    a: ["students", "remote workers", "teachers", "new parents", "freelancers"] },
  { k: /\b(music|video|photos?|images?|design|draw\w*|art|games?|writing|podcasts?)\b/i,
    p: ["A quick {k} idea generator", "Share your {k} in one tap", "A weekly {k} challenge"],
    a: ["artists", "students", "teenagers", "hobbyists", "friends"] },
  { k: /\b(chat|social|community|events?|groups?|team|collaborat\w*|polls?|volunteer\w*)\b/i,
    p: ["Simple {k} coordination", "A no-signup way to run {k}", "{k} planning without the chaos"],
    a: ["church groups", "sports clubs", "roommates", "neighbors", "classrooms"] }
];

function pick(arr, n) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

function rewrite(items) {
  const out = [], seen = {}, perCat = {};
  items.forEach(it => {
    for (let c = 0; c < CATS.length; c++) {
      const m = CATS[c].k.exec(it.title);
      if (!m) continue;
      if ((perCat[c] || 0) >= 6) return;
      let k = m[0].toLowerCase();
      if (ACR[k]) k = k.toUpperCase();
      let p = pick(CATS[c].p, 1)[0].replace("{k}", k);
      p = p.charAt(0).toUpperCase() + p.slice(1);
      if (p.length > 48 || seen[p]) return;
      seen[p] = 1;
      perCat[c] = (perCat[c] || 0) + 1;
      out.push({ p: p, a: pick(CATS[c].a, 3), source: it.source, url: it.url });
      return;
    }
  });
  return out;
}

(async () => {
  let all = [];
  for (const f of [hn, gh, dev]) {
    try { all = all.concat(await f()); } catch (e) { console.log("skip", f.name, e.message); }
  }
  all = all.filter(i => i.title.length > 10 && i.title.length < 140).sort((a, b) => b.score - a.score);
  const out = rewrite(all);
  if (!out.length) { console.log("no usable items, keeping old file"); return; }
  fs.writeFileSync("public/ideas.json", JSON.stringify({ updated: new Date().toISOString(), items: out }, null, 1));
  console.log("wrote", out.length);
})();
