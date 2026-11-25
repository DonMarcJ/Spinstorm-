(function () {
  fetch("ideas.json")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.items || typeof DATA === "undefined" || typeof POOL === "undefined") return;

      var by = {};
      j.items.forEach(function (i) {
        var t = (i.title || "").trim();
        if (t.length < 12 || t.length > 50) return;
        if (!/^https:\/\//.test(i.url || "")) return;
        (by[i.source] = by[i.source] || []).push({ t: t, s: i.source, u: i.url, sc: i.score || 0 });
      });

      var picked = [];
      Object.keys(by).forEach(function (k) {
        by[k].sort(function (a, b) { return b.sc - a.sc; });
        picked = picked.concat(by[k].slice(0, 8));
      });
      if (!picked.length) return;

      var lookup = {};
      picked.forEach(function (i) {
        var a = [], t = [], n;
        for (n = 0; n < 3; n++) a.push(rnd(POOL[1]));
        for (n = 0; n < 2; n++) t.push(rnd(POOL[2]));
        DATA.push({ p: i.t, a: a, t: t });
        POOL[0].push(i.t);
        lookup[i.t] = i;
      });

      var tag = document.createElement("p");
      tag.style.cssText = "text-align:center;font-size:13px;opacity:.7;margin:6px 0;display:none";
      var meta = document.querySelector(".meta");
      if (meta && meta.parentNode) meta.parentNode.insertBefore(tag, meta.nextSibling);

      function show() {
        var i = window.cur && lookup[window.cur[0]];
        if (!i) { tag.style.display = "none"; return; }
        tag.innerHTML = "";
        var a = document.createElement("a");
        a.href = i.u; a.target = "_blank"; a.rel = "noopener";
        a.style.color = "inherit";
        a.textContent = "From " + i.s + " ↗";
        tag.appendChild(a);
        tag.style.display = "block";
      }
      new MutationObserver(show).observe($("eff"), { childList: true, characterData: true, subtree: true });
      $("spin").addEventListener("click", function () { tag.style.display = "none"; });
    })
    .catch(function () {});
})();
