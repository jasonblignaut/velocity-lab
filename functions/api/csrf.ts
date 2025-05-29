// functions/api/csrf.ts
export const onRequestGet: PagesFunction<Env> = async () => {
  const csrfToken = "hardcoded-csrf-token-12345"; // hardcoded token

  return new Response(JSON.stringify({ csrfToken }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
