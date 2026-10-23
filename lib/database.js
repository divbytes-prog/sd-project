import pg from 'pg';
const {Pool}=pg;
export const pool=new Pool({connectionString:process.env.DATABASE_URL,max:5,idleTimeoutMillis:10000,connectionTimeoutMillis:15000,application_name:'InstituteConnect'});
pool.on('error',()=>console.error(JSON.stringify({event:'database_pool_error'})));
export async function transaction(fn){const client=await pool.connect();try{await client.query('BEGIN');await client.query("SET LOCAL lock_timeout='10s'");await client.query("SET LOCAL statement_timeout='20s'");const result=await fn(client);await client.query('COMMIT');return result}catch(error){await client.query('ROLLBACK').catch(()=>{});throw error}finally{client.release()}}
