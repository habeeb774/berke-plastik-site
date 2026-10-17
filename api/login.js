import crypto from 'node:crypto';
import { sql, ip, isAuthed, newSession, endSession, sameOrigin, audit, safe } from './_lib.js';
const clean=s=>String(s||'').replace(/[\s‎‏‪-‮⁦-⁩﻿]/g,'');
const MAX_FAILS=5, WINDOW_MIN=15;
function scryptHash(p,salt=crypto.randomBytes(16).toString('hex')){return 'scrypt$'+salt+'$'+crypto.scryptSync(p,salt,64).toString('hex')}
function eq(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y)}
async function checkPw(p){
  const r=await sql`select v from admin_cfg where k='pw'`;
  if(r.length){const[, salt, h]=r[0].v.split('$');return eq(crypto.scryptSync(p,salt,64).toString('hex'),h)}
  const env=clean(process.env.ADMIN_PASSWORD); if(!env) return false;
  return eq(crypto.createHash('sha256').update(p).digest('hex'),crypto.createHash('sha256').update(env).digest('hex'));
}
export default safe(async function(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET') return res.json({ok:await isAuthed(req)});
  if(!sameOrigin(req)) return res.status(403).json({error:'origin'});
  if(req.method==='DELETE'){ await endSession(req,res); await audit(req,'logout'); return res.json({ok:true}); }
  if(req.method!=='POST') return res.status(405).end();
  const b=req.body||{};
  if(b.action==='change'){
    if(!(await isAuthed(req))) return res.status(401).json({error:'auth'});
    const cur=clean(b.current), nxt=String(b.next||'');
    if(!(await checkPw(cur))){ await audit(req,'pw_change_fail'); return res.status(400).json({error:'كلمة المرور الحالية غير صحيحة'}); }
    if(nxt.length<10||!/[A-Za-z]/.test(nxt)||!/\d/.test(nxt)) return res.status(400).json({error:'كلمة المرور الجديدة: 10 أحرف على الأقل وتحتوي حروفاً إنجليزية وأرقاماً'});
    await sql`insert into admin_cfg(k,v) values('pw',${scryptHash(clean(nxt))}) on conflict(k) do update set v=excluded.v`;
    await sql`delete from admin_session`; await newSession(req,res); await audit(req,'pw_changed');
    return res.json({ok:true});
  }
  const who=ip(req);
  const f=await sql`select count(*)::int n from login_fail where ip=${who} and at>now()-make_interval(mins=>${WINDOW_MIN})`;
  if(f[0].n>=MAX_FAILS){ await audit(req,'login_locked'); return res.status(429).json({error:`محاولات كثيرة، حاول بعد ${WINDOW_MIN} دقيقة`}); }
  if(!(await checkPw(clean(b.password)))){
    await sql`insert into login_fail(ip) values(${who})`; await sql`delete from login_fail where at<now()-interval '1 day'`;
    await audit(req,'login_fail'); await new Promise(r=>setTimeout(r,1200));
    return res.status(401).json({error:`كلمة المرور غير صحيحة (متبقٍ ${Math.max(0,MAX_FAILS-f[0].n-1)} محاولات)`});
  }
  await sql`delete from login_fail where ip=${who}`; await newSession(req,res); await audit(req,'login');
  res.json({ok:true});
});
