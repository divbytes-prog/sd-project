import {pool} from '../../../lib/database.js';
import {isDatabaseConfigured} from '../../../lib/workspace-repository.js';
export const dynamic='force-dynamic';
export async function GET(){
  if (!isDatabaseConfigured) return Response.json({status:'ok',mode:'local'},{headers:{'Cache-Control':'no-store'}});
  try{await pool.query('SELECT 1');return Response.json({status:'ok'},{headers:{'Cache-Control':'no-store'}})}catch{console.error(JSON.stringify({event:'health_database_unavailable'}));return Response.json({status:'unavailable'},{status:503})}
}

