export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const cookies = context.request.headers.get('Cookie');
    const sessionToken = cookies?.match(/session=([^;]+)/)?.[1];
    if (sessionToken) {
      await context.env.USERS.delete(`session:${sessionToken}`);
    }
    return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
      status: 200,
      headers: {
        'Set-Cookie': `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    return jsonResponse({ error: 'Server error' }, 500);
  }
};

function jsonResponse(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}