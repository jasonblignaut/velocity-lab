export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    return new Response(null, {
      status: 200,
      headers: {
        'Set-Cookie': `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`,
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};