import {auth, isNeonConfigured} from '../../../../lib/auth.js';
import {handleLocalAuth} from '../../../../lib/local-auth-handler.js';

export const dynamic = 'force-dynamic';

const realHandler = isNeonConfigured ? auth.handler() : null;

export async function GET(request, context) {
  if (realHandler) return realHandler.GET(request, context);
  return handleLocalAuth(request, context);
}

export async function POST(request, context) {
  if (realHandler) return realHandler.POST(request, context);
  return handleLocalAuth(request, context);
}

export async function PUT(request, context) {
  if (realHandler) return realHandler.PUT(request, context);
  return handleLocalAuth(request, context);
}

export async function DELETE(request, context) {
  if (realHandler) return realHandler.DELETE(request, context);
  return handleLocalAuth(request, context);
}

export async function PATCH(request, context) {
  if (realHandler) return realHandler.PATCH(request, context);
  return handleLocalAuth(request, context);
}

