import { neon } from '@neondatabase/serverless';
import crypto from 'node:crypto';
export const sql = neon(process.env.DATABASE_URL);
export const TEXT_KEY = /^(t\d{1,3}|s\d|title|contact|wa)$/;
export const IMG_KEYS = ['logo','hero','proof','ppr','rad','pex','brass','std1','std2','std3','std4'];
const sign = s => crypto.createHmac('sha256', process.env.SESSION_SECRET).update(s).digest('hex');
export function makeToken(){ const exp = String(Date.now() + 8*3600e3); return exp + '.' + sign(exp); }
export function isAuthed(req){
  const m = (req.headers.cookie||'').match(/(?:^|;\s*)s=([^;]+)/); if(!m) return false;
  const [exp, sig] = m[1].split('.'); if(!exp||!sig||Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp)); return a.length===b.length && crypto.timingSafeEqual(a,b);
}
export function guard(req,res){
  if(req.method!=='POST'){res.status(405).end();return false}
  const o=req.headers.origin; if(o && o!=='https://'+req.headers.host){res.status(403).json({error:'origin'});return false}
  if(!isAuthed(req)){res.status(401).json({error:'auth'});return false}
  return true;
}
