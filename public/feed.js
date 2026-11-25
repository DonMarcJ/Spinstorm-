(function () {
  fetch("ideas.json")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.items || typeof DATA === "undefined" || typeof POOL === "undefined") return;
      var lookup = {};
      j.items.forEach(function (i) {
        if (!i.p || !i.a || !/^https:\/\//.test(i.url || "")) return;
        var t = [rnd(POOL[2]), rnd(POOL[2])];
        DATA.push({ p: i.p, a: i.a.map(function (x) { return "For " + x; }), t: t });
        POOL[0].push(i.p);
        lookup[i.p] = i;
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
        a.href = i.url; a.target = "_blank"; a.rel = "noopener"; a.style.color = "inherit";
        a.textContent = "Inspired by " + i.source + " ↗";
        tag.appendChild(a);
        tag.style.display = "block";
      }
      new MutationObserver(show).observe($("eff"), { childList: true, characterData: true, subtree: true });
      $("spin").addEventListener("click", function () { tag.style.display = "none"; });
    })
    .catch(function () {});
})();
