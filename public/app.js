document.documentElement.setAttribute("data-theme","dark");
/* SETTINGS: fill these two lines, then save. Leave "" to switch a feature off. */
var GC="";      /* GoatCounter site code, e.g. "spinstorm" (from spinstorm.goatcounter.com) */
var CONTACT="https://forms.gle/J2zn5KLSP5a1tfCPA"; /* partner link: "mailto:you@example.com" or a form link like "https://forms.gle/..." */
function track(p){try{if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:p,event:true})}catch(e){}}
if(GC){var gs=document.createElement("script");gs.async=true;gs.setAttribute("data-goatcounter","https://"+GC+".goatcounter.com/count");gs.src="https://gc.zgo.at/count.js";document.head.appendChild(gs)}
var LOCK='<svg viewBox="0 0 24 24"><path class="sh" d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#3a4260" stroke-width="2.2" stroke-linecap="round"/><rect x="5" y="11" width="14" height="10" rx="2.5" fill="#3a4260"/></svg>';
[0,1,2].forEach(function(i){document.getElementById("l"+i).innerHTML=LOCK});
var EFF=["Weekend","Weekend","A week","A week","A month"];
var mode="sensible",locked=[false,false,false],busy=false,cur=null,pins=[];
function $(id){return document.getElementById(id)}
function rnd(a){return a[Math.floor(Math.random()*a.length)]}
function uniq(k){var s={};DATA.forEach(function(d){(Array.isArray(d[k])?d[k]:[d[k]]).forEach(function(x){s[x]=1})});return Object.keys(s)}
var POOL=[uniq("p"),uniq("a"),uniq("t")];
function toast(m){$("toast").textContent=m;setTimeout(function(){if($("toast").textContent===m)$("toast").textContent=""},1800)}
function haptic(n){try{if(navigator.vibrate)navigator.vibrate(n)}catch(e){}}
function roll(){
 var r=cur?cur.slice():[null,null,null];
 if(mode==="sensible"){
  var base=locked[0]&&r[0]?DATA.filter(function(d){return d.p===r[0]})[0]:rnd(DATA);
  if(!locked[0])r[0]=base.p;
  if(!locked[1])r[1]=rnd(base.a);
  if(!locked[2])r[2]=rnd(base.t);
 }else{for(var i=0;i<3;i++)if(!locked[i])r[i]=rnd(POOL[i])}
 return r;
}
function text(r){return r[0]+", "+r[1].toLowerCase()+", "+r[2].toLowerCase()}
$("modes").addEventListener("click",function(e){
 var m=e.target.getAttribute("data-m");if(!m)return;mode=m;track("mode/"+m);
 Array.prototype.forEach.call($("modes").children,function(b){b.classList.toggle("on",b.getAttribute("data-m")===m)});
});
[0,1,2].forEach(function(i){$("l"+i).addEventListener("click",function(){
 if(!cur){toast("Spin first");return}
 locked[i]=!locked[i];track("lock/"+(locked[i]?"on":"off"));$("l"+i).classList.toggle("on",locked[i]);$("w"+i).classList.toggle("lit",locked[i]);haptic(12);
})});
$("spin").addEventListener("click",function(){
 if(busy)return;
 var res=roll(),stops=[800,1250,1700],active=0,done=0;busy=true;
 [0,1,2].forEach(function(i){
  if(locked[i])return;active++;
  var el=$("v"+i),w=$("w"+i);w.classList.add("spin");w.classList.remove("land");
  var t=setInterval(function(){el.textContent=rnd(POOL[i])},70);
  setTimeout(function(){
   clearInterval(t);el.textContent=res[i];w.classList.remove("spin");void w.offsetWidth;w.classList.add("land");haptic(15);done++;
   if(done===active){cur=res;track("spin/"+mode+"/"+res[0]);$("eff").textContent="Effort: "+rnd(EFF);var f=$("flash");f.classList.remove("go");void f.offsetWidth;f.classList.add("go");haptic([20,40,30]);busy=false}
  },stops[i]);
 });
 if(!active){busy=false;toast("Unlock a reel to spin")}
});
function load(){try{pins=JSON.parse(localStorage.getItem("spinstorm_pins")||"[]")}catch(e){pins=[]}}
function save(){try{localStorage.setItem("spinstorm_pins",JSON.stringify(pins))}catch(e){}}
var ST=["Idea","Building","Shipped"];
function copy(s){try{navigator.clipboard.writeText(s).then(function(){toast("Copied")},function(){toast("Couldn’t copy")})}catch(e){toast("Couldn’t copy")}}
function render(newId){
 var box=$("pins");box.innerHTML="";
 if(!pins.length){var d=document.createElement("div");d.className="empty";d.textContent="Nothing pinned yet. Spin, then tap Pin.";box.appendChild(d);return null}
 var hit=null;
 pins.forEach(function(p){
  var row=document.createElement("div");row.className="pin";
  var t=document.createElement("div");t.className="t";t.textContent=p.text;
  var st=document.createElement("button");st.className="st "+ST[p.s].toLowerCase();st.textContent=ST[p.s];
  st.addEventListener("click",function(){p.s=(p.s+1)%3;save();render()});
  var cp=document.createElement("button");cp.className="ib";cp.setAttribute("aria-label","Copy idea");cp.textContent="⧉";
  cp.addEventListener("click",function(){copy(p.text)});
  var rm=document.createElement("button");rm.className="ib";rm.setAttribute("aria-label","Unpin");rm.textContent="✕";
  rm.addEventListener("click",function(){pins=pins.filter(function(x){return x.id!==p.id});save();render()});
  row.appendChild(t);row.appendChild(st);row.appendChild(cp);row.appendChild(rm);box.appendChild(row);
  if(p.id===newId)hit=row;
 });
 return hit;
}
$("pin").addEventListener("click",function(){
 if(!cur||busy){toast("Spin first");return}
 var s=text(cur);
 if(pins.some(function(p){return p.text===s})){toast("Already pinned");return}
 var from=$("w0").getBoundingClientRect();
 var p={id:Date.now(),text:s,s:0};pins.unshift(p);save();track("pin/"+s);
 var row=render(p.id);haptic(25);
 if(row&&row.animate){
  var to=row.getBoundingClientRect();
  row.animate([{transform:"translate("+(from.left-to.left)+"px,"+(from.top-to.top)+"px) scale(1.05)",opacity:.5},{transform:"none",opacity:1}],{duration:650,easing:"cubic-bezier(.34,1.3,.64,1)"});
 }
 toast("Pinned");
});
if(CONTACT){$("plink").href=CONTACT;$("partner").style.display="block";$("plink").addEventListener("click",function(){track("partner-click")})}
load();render();
