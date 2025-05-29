export const onRequestGet: PagesFunction<Env> = async (context) => {
  const token = crypto.randomUUID();

  await context.env.USERS.put(`csrf:${token}`, 'valid', {
    expirationTtl: 300, // 5 minutes
  });

  return new Response(
    JSON.stringify({ token }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};
