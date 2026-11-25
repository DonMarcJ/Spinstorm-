(function () {
  var row = document.createElement("div");
  row.style.cssText = "display:none;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0";
  var opts = [["interesting", "Interesting"], ["irrelevant", "Not relevant"], ["exists", "Already exists"], ["build", "I'd build this"]];
  var voted = {};
  var msg = document.createElement("p");
msg.style.cssText = "width:100%;text-align:center;font-size:13px;font-weight:600;margin:2px 0;color:#1b2540;display:none";
function say(t) {
  msg.textContent = t;
  msg.style.display = "block";
  clearTimeout(say.t);
  say.t = setTimeout(function () { msg.style.display = "none"; }, 1500);
}

  opts.forEach(function (o) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = o[1];
    b.style.cssText = "font-size:12px;font-weight:600;padding:6px 10px;border-radius:14px;border:1px solid rgba(20,30,60,.5);background:rgba(255,255,255,.9);color:#1b2540";
    b.addEventListener("click", function () {
      if (!window.cur) return;
      var id = text(window.cur);
      if (voted[id]) { say("Already rated"); return; }
      voted[id] = 1;
      track("fb/" + o[0] + "/" + id);
      b.style.background = "rgba(255,215,0,.9)";
      Say("Thanks!");
    });
    row.appendChild(b);
  });

  row.appendChild(msg);
  var spin = $("spin");
  spin.parentNode.insertBefore(row, spin);

  function show() { if (window.cur) { row.style.display = "flex"; } }
  new MutationObserver(show).observe($("eff"), { childList: true, characterData: true, subtree: true });
  spin.addEventListener("click", function () {
    row.style.display = "none";
    Array.prototype.forEach.call(row.children, function (c) { c.style.background = "rgba(255,255,255,.6)"; });
  });
})();
