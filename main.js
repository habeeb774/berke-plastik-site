(()=>{const n=document.querySelector('.nav'),b=document.querySelector('.hamb');if(!n||!b)return;
b.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
n.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');b.setAttribute('aria-expanded','false')}));})();
