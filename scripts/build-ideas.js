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
}

(async () => {
  let all = [];
  for (const f of [hn, gh, dev]) {
    try { all = all.concat(await f()); } catch (e) { console.log("skip", f.name, e.message); }
  }
  all = all.filter(i => i.title.length > 10 && i.title.length < 140);
  if (!all.length) { console.log("no items, keeping old file"); return; }
  fs.writeFileSync("public/ideas.json", JSON.stringify({ updated: new Date().toISOString(), items: all }, null, 1));
  console.log("wrote", all.length);
})();
