const fs = require("fs");

async function j(u) {
  const headers = { "User-Agent": "spinstorm" };
  if (process.env.GH_TOKEN && u.includes("api.github.com")) headers.Authorization = "Bearer " + process.env.GH_TOKEN;
  const r = await fetch(u, { headers });
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
}                                                   
const CATS = [
  { k: /\b(editor|terminal|cli|compiler|debugger|git|sql|sdk|devtools?)\b/i,
    n: ["Git", "SQL", "the terminal", "debugging", "APIs"],
    p: ["Learn {n} in 10 minutes a day", "A plain-English guide to {n}", "A cheat-sheet app for {n}"],
    a: ["students", "self-taught developers", "bootcamp grads", "junior developers", "career switchers"] },
  { k: /\b(ai|llm|gpt|agents?|chatbots?|rag|prompt\w*)\b/i,
    n: ["AI", "AI tools", "prompting"],
    p: ["A plain-English guide to {n}", "A daily tip for using {n}", "Everyday jobs made easier with {n}"],
    a: ["teachers", "small shops", "students", "freelancers", "office workers"] },
  { k: /\b(budget\w*|invoice\w*|expenses?|tax(es)?|payments?|savings?|money|finance|pricing)\b/i,
    n: ["budgeting", "invoicing", "expense tracking", "saving"],
    p: ["Dead-simple {n}", "{n} on a single screen", "A friendlier way to handle {n}"],
    a: ["freelancers", "street vendors", "small shops", "students", "couples"] },
  { k: /\b(habits?|sleep|workouts?|fitness|meditation|diet|mood|health)\b/i,
    n: ["habit tracking", "sleep", "workouts", "meditation", "mood"],
    p: ["A tiny tracker for {n} you'll actually use", "A 10-second daily check-in for {n}", "A kinder way to keep up with {n}"],
    a: ["night-shift workers", "new parents", "beginners", "office workers", "retirees"] },
  { k: /\b(flashcards?|study|language|quiz\w*|tutorial|course)\b/i,
    n: ["languages", "flashcards", "study habits", "quizzes"],
    p: ["Bite-sized {n} on your phone", "A study buddy for {n}", "{n}, made social"],
    a: ["students", "travelers", "immigrants", "job seekers", "teachers"] },
  { k: /\b(todo|tasks?|notes?|calendar|schedule|reminders?|planner|focus|timer)\b/i,
    n: ["to-dos", "reminders", "focus time", "your schedule"],
    p: ["A one-screen app for {n}", "A polite nag for {n}", "A calmer way to manage {n}"],
    a: ["students", "remote workers", "teachers", "new parents", "freelancers"] },
  { k: /\b(music|video|photos?|drawing|design|podcasts?|writing|games?)\b/i,
    n: ["music", "photos", "drawing", "writing", "games"],
    p: ["A quick idea generator for {n}", "Share your {n} in one tap", "A weekly {n} challenge"],
    a: ["artists", "students", "teenagers", "hobbyists", "friends"] },
  { k: /\b(events?|polls?|volunteer\w*|community|collaborat\w*)\b/i,
    n: ["group events", "volunteering", "team polls", "community meetups"],
    p: ["Simple coordination for {n}", "A no-signup way to run {n}", "Planning {n} without the chaos"],
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
      const hit = m[0].toLowerCase();
      const noun = CATS[c].n.find(x => x.toLowerCase().includes(hit)) || pick(CATS[c].n, 1)[0];
      let p = pick(CATS[c].p, 1)[0].replace("{n}", noun);
      p = p.charAt(0).toUpperCase() + p.slice(1);
      if (p.length > 52 || seen[p]) return;
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
