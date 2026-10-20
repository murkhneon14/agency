export function jsonError(message, status = 400, code = "request_error") {
  return Response.json({ error: { code, message } }, { status });
}

export function roleErrorResponse(result) {
  if (!result?.error) return null;
  return jsonError(
    result.error === "unauthenticated" ? "Sign in to continue." : "You do not have access to this resource.",
    result.status,
    result.error,
  );
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
