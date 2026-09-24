import postgres from "postgres";

const target = process.argv[2];
if (!target) {
  console.error("usage: node --env-file=.env e2e/cleanup.mjs <email-or-prefix>");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);
try {
  const result = await sql`
    delete from "user"
    where email like ${target + "%"}
  `;
  console.log(`deleted ${result.count} user(s) matching: ${target}%`);
} finally {
  await sql.end();
}