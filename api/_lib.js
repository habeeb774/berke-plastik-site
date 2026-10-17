import { neon } from '@neondatabase/serverless';
import crypto from 'node:crypto';
export const sql = neon(process.env.DATABASE_URL);
export const TEXT_KEY = /^(t\d{1,3}|s\d|title|contact|wa)$/;
export const IMG_KEYS = ['logo','hero','proof','ppr','rad','pex','brass'];
export const SESSION_HOURS = 8;
export const sha = s => crypto.createHash('sha256').update(s).digest('hex');
export function ip(req){ return String(req.headers['x-real-ip'] || (req.headers['x-forwarded-for']||'').split(',')[0] || '').trim().slice(0,64) || 'unknown'; }
function sid(req){ const m=(req.headers.cookie||'').match(/(?:^|;\s*)s=([A-Za-z0-9_-]{20,100})/); return m?m[1]:null; }
export async function isAuthed(req){
  const s=sid(req); if(!s) return false;
  const r=await sql`select 1 from admin_session where id=${sha(s)} and exp>now()`; return r.length>0;
}
export async function newSession(req,res){
  const s=crypto.randomBytes(32).toString('base64url');
  await sql`delete from admin_session where exp<now()`;
  await sql`insert into admin_session(id,exp,ip) values(${sha(s)}, now()+make_interval(hours=>${SESSION_HOURS}), ${ip(req)})`;
  res.setHeader('Set-Cookie',`s=${s}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_HOURS*3600}`);
}
export async function endSession(req,res){ const s=sid(req); if(s) await sql`delete from admin_session where id=${sha(s)}`; res.setHeader('Set-Cookie','s=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0'); }
export function sameOrigin(req){ const o=req.headers.origin; return !!o && o==='https://'+req.headers.host && req.headers['x-admin']==='1'; }
export async function guard(req,res){
  if(req.method!=='POST'){res.status(405).end();return false}
  if(!sameOrigin(req)){res.status(403).json({error:'origin'});return false}
  if(!(await isAuthed(req))){res.status(401).json({error:'auth'});return false}
  return true;
}
export async function audit(req,action,detail=''){ try{ await sql`insert into audit_log(ip,action,detail) values(${ip(req)},${action},${String(detail).slice(0,300)})`; }catch{} }
export const safe = fn => async (req,res) => { try { return await fn(req,res); } catch(e){ console.error(e); if(!res.headersSent) res.status(500).json({error:'خطأ في الخادم'}); } };
