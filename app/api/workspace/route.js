import {randomUUID} from 'node:crypto';
import {auth} from '../../../lib/auth.js';
import {workspaceRequest} from '../../../lib/workspace-repository.js';
import {ServiceError} from '../../../lib/workspace-service.mjs';
export const dynamic='force-dynamic';
async function handle(request,write=false){const requestId=randomUUID(),start=Date.now();try{
 if(write){const origin=request.headers.get('origin'),expected=process.env.APP_ORIGIN||new URL(request.url).origin;const local=process.env.NODE_ENV==='development'&&origin===new URL(request.url).origin;if(origin!==expected&&!local)throw new ServiceError('Request origin is not permitted.',403,'ORIGIN_REJECTED');if(!request.headers.get('content-type')?.startsWith('application/json'))throw new ServiceError('Use a JSON request.',415);if(Number(request.headers.get('content-length')||0)>65536)throw new ServiceError('Request too large.',413)}
 const {data:session}=await auth.getSession({query:{disableCookieCache:"true"}});
 if(!session?.user)throw new ServiceError('Please sign in to continue.',401,'UNAUTHENTICATED');
 let operation=null;if(write){const text=await request.text();if(text.length>65536)throw new ServiceError('Request too large.',413);operation=JSON.parse(text);if(!operation||typeof operation.action!=='string'||!operation.args||typeof operation.args!=='object'||Array.isArray(operation.args))throw new ServiceError('Invalid workspace request.')}
 const result=await workspaceRequest(session.user,operation);
 console.info(JSON.stringify({event:'workspace_request',requestId,method:write?'POST':'GET',ms:Date.now()-start,status:200}));
 return Response.json(result,{headers:{'Cache-Control':'private, no-store','X-Request-Id':requestId}});
 }catch(error){const known=error instanceof ServiceError;const validation=error.constructor===Error;const status=known?error.status:error instanceof SyntaxError?400:validation?400:503;
 console.error(JSON.stringify({event:'workspace_error',requestId,status,code:known?error.code:'REQUEST_FAILED',ms:Date.now()-start}));
 return Response.json({error:known||validation?error.message:status===400?'Invalid request.':'Service temporarily unavailable. Please try again.',code:known?error.code:'REQUEST_FAILED',requestId},{status,headers:{'Cache-Control':'private, no-store','X-Request-Id':requestId}})} }
export async function GET(request){return handle(request)}
export async function POST(request){return handle(request,true)}
