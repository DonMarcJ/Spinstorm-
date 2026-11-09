function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
function wrap(x,t,max){var w=t.split(" "),l=[],c="";w.forEach(function(k){var tt=c?c+" "+k:k;if(x.measureText(tt).width>max&&c){l.push(c);c=k}else c=tt});l.push(c);return l}
function drawLogo(x,px,py,sz){
 var g=x.createLinearGradient(0,py,0,py+sz);g.addColorStop(0,"#a9b6d1");g.addColorStop(.5,"#6b7a9a");g.addColorStop(.5,"#4b5a7c");g.addColorStop(1,"#6b7a9a");
 rr(x,px,py,sz,sz,sz*.23);x.fillStyle=g;x.fill();x.lineWidth=sz*.03;x.strokeStyle="#151b2b";x.stroke();
 var k=sz/48,bg=x.createLinearGradient(0,py,0,py+sz);bg.addColorStop(0,"#fff6b8");bg.addColorStop(.5,"#ffd83a");bg.addColorStop(.5,"#f1b500");bg.addColorStop(1,"#ffd02a");
 var P=[[27,7],[13,26],[22,26],[19,41],[35,20],[26,20],[31,7]];
 x.beginPath();P.forEach(function(q,i){var X=px+q[0]*k,Y=py+q[1]*k;if(i)x.lineTo(X,Y);else x.moveTo(X,Y)});x.closePath();
 x.fillStyle=bg;x.fill();x.lineWidth=sz*.025;x.strokeStyle="#8a6500";x.lineJoin="round";x.stroke();
 rr(x,px+sz*.08,py+sz*.08,sz*.84,sz*.4,sz*.19);x.fillStyle="rgba(255,255,255,.28)";x.fill();
}
function poster(){
 var W=1080,H=1350,c=document.createElement("canvas");c.width=W;c.height=H;var x=c.getContext("2d");
 var F="Helvetica Neue,Helvetica,Arial,sans-serif";
 var g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#222b45");g.addColorStop(1,"#0a0c16");x.fillStyle=g;x.fillRect(0,0,W,H);
 x.fillStyle="rgba(255,255,255,.03)";for(var i=0;i<W;i+=12)x.fillRect(i,0,6,H);
 var rg=x.createRadialGradient(W/2,260,20,W/2,260,620);rg.addColorStop(0,"rgba(255,216,58,.3)");rg.addColorStop(1,"rgba(255,216,58,0)");x.fillStyle=rg;x.fillRect(0,0,W,H);
 drawLogo(x,W/2-70,70,140);
 x.textAlign="center";x.fillStyle="#fff";x.font="800 76px "+F;x.fillText("SPINSTORM",W/2,300);
 x.fillStyle="#98a2c0";x.font="600 34px "+F;x.fillText("Today’s storm brought you",W/2,360);
 var L=["PROBLEM","AUDIENCE","TWIST"];
 for(var n=0;n<3;n++){
  var y0=420+n*215;
  x.textAlign="left";x.fillStyle="#c8d0e8";x.font="700 28px "+F;x.fillText(L[n],96,y0+4);
  var wg=x.createLinearGradient(0,y0+20,0,y0+170);wg.addColorStop(0,"#f7fbff");wg.addColorStop(1,"#d5e0ec");
  rr(x,80,y0+20,920,150,30);x.fillStyle=wg;x.fill();x.lineWidth=5;x.strokeStyle="#0f1424";x.stroke();
  rr(x,88,y0+26,904,64,24);x.fillStyle="rgba(255,255,255,.55)";x.fill();
  var fs=56,lines;x.font="800 "+fs+"px "+F;lines=wrap(x,cur[n],840);
  if(lines.length>1){fs=44;x.font="800 "+fs+"px "+F;lines=wrap(x,cur[n],840)}
  var lh=fs*1.15,sy=y0+95-(lines.length-1)*lh/2+fs*.34;
  x.textAlign="center";x.fillStyle="#18202f";
  lines.forEach(function(t,j){x.fillText(t,W/2,sy+j*lh)});
 }
 var et=$("eff").textContent;x.font="700 34px "+F;var tw=x.measureText(et).width+80;
 rr(x,W/2-tw/2,1090,tw,70,35);var pg=x.createLinearGradient(0,1090,0,1160);pg.addColorStop(0,"#5b6784");pg.addColorStop(1,"#2b3550");x.fillStyle=pg;x.fill();
 x.fillStyle="#fff";x.textAlign="center";x.fillText(et,W/2,1136);
 x.fillStyle="#ffd83a";x.font="800 38px "+F;x.fillText("Spin yours at "+location.host,W/2,1220);
 x.fillStyle="#98a2c0";x.font="600 28px "+F;x.fillText("Created by Donn under La Vida Cambius",W/2,1285);
 return c;
}
$("share").addEventListener("click",function(){
 if(!cur||busy){toast("Spin first");return}
 var s="Spinstorm gave me: "+text(cur)+". Dare you to build it.";
 track("share/"+cur[0]);var c;try{c=poster()}catch(e){c=null}
 if(!c){if(navigator.share){navigator.share({text:s}).catch(function(){})}else copy(s);return}
 c.toBlob(function(b){
  if(!b){copy(s);return}
  var f=null;try{f=new File([b],"spinstorm.png",{type:"image/png"})}catch(e){}
  if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:s}).catch(function(){})}
  else{var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="spinstorm.png";document.body.appendChild(a);a.click();a.remove();toast("Poster saved")}
 },"image/png");
});
