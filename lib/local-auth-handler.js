// Legacy development handler is intentionally unavailable. All portals use managed Neon Auth.
export async function handleLocalAuth(){return Response.json({error:{message:'Use the managed authentication service.'}},{status:503})}
