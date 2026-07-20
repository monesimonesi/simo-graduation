const msgs=[
'Verificando attività neuronale...',
'Connessione con ChatGPT...',
'Connessione rifiutata.',
'Modalità Human Intelligence attivata.',
'Analisi completata.'
];
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}
function start(){
const n=document.getElementById('name').value.trim();
if(!n){alert('Inserisci il tuo nome');return;}
window.userName=n;
show('verify');
let i=0;
const fill=document.getElementById('fill');
const status=document.getElementById('status');
const t=setInterval(()=>{
status.textContent=msgs[i];
fill.style.width=((i+1)/msgs.length*100)+'%';
i++;
if(i===msgs.length){
clearInterval(t);
setTimeout(()=>finish(),700);
}
},700);
}
function finish(){
document.getElementById('certName').textContent=window.userName;
document.getElementById('cid').textContent='Certificate ID: HIC-2026-'+Math.floor(1000+Math.random()*9000);
show('certificateScreen');
}
function downloadCert(){
html2canvas(document.getElementById('certificate'),{scale:2}).then(canvas=>{
const a=document.createElement('a');
a.download='certificato.png';
a.href=canvas.toDataURL();
a.click();
});
}
function showSolution(){
alert('Qui comparirà la soluzione del rompicapo!');
}
