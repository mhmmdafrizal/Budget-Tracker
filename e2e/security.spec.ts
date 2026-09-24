import { test, expect } from "@playwright/test";
import postgres from "postgres";
import { readFileSync } from "node:fs";

// Playwright doesn't auto-load .env — load DATABASE_URL for the cleanup helper below
(function loadEnv() {
  const raw = readFileSync(".env", "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z_]+)="?(.*?)"?\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
})();

const PREFIX = `sec-${Date.now()}`;
const PASSWORD = "SecurePass123!";

// track emails created in this run for cleanup
const createdEmails: string[] = [];

function email() {
  const e = `${PREFIX}-${createdEmails.length}-${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;
  createdEmails.push(e);
  return e;
}

test.afterAll(async () => {
  // no-op — cleanup is done via e2e/cleanup.mjs with the PREFIX
  console.log(`run prefix: ${PREFIX} (delete with: node --env-file=.env e2e/cleanup.mjs ${PREFIX})`);
});

async function register(page: import("@playwright/test").Page, userEmail: string, password = PASSWORD) {
  await page.goto("/signin");
  await page.getByRole("button", { name: "Daftar" }).click();
  await page.getByLabel("Nama Lengkap").fill("Sec User");
  await page.getByLabel("Email").fill(userEmail);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Daftar", exact: true }).click();
}

async function login(page: import("@playwright/test").Page, userEmail: string, password = PASSWORD) {
  await page.goto("/signin");
  await page.getByLabel("Email").fill(userEmail);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
}

test.describe("security", () => {
  test("1. API rejects bad credentials and sets no session cookie", async ({ page }) => {
    await page.goto("/signin");
    const res = await page.evaluate(async () => {
      const r = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "nobody@example.com", password: "WrongPass123!" }),
      });
      return { status: r.status, body: await r.text() };
    });

    expect(res.status).toBe(401);
    expect(res.body).toContain("email or password");

    const cookies = await page.context().cookies("http://localhost:3001");
    const session = cookies.find((c) => c.name === "better-auth.session_token");
    expect(session).toBeUndefined();
  });

  test("2. failed login shows error and stays on /signin", async ({ page }) => {
    await page.goto("/signin");
    await page.getByLabel("Email").fill(email());
    await page.getByLabel("Password").fill("WrongPass123!");
    await page.getByRole("button", { name: "Masuk", exact: true }).click();

    await expect(page).toHaveURL(/\/signin$/);
    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible();
    await expect(page.locator("[data-sonner-toast]")).toContainText(/email or password/i);
  });

  test("3. weak password blocked on signup", async ({ page }) => {
    await register(page, email(), "short");

    // native minLength=8 validation blocks submit — no redirect, still signed out
    await expect(page).toHaveURL(/\/signin$/);
    const cookies = await page.context().cookies("http://localhost:3001");
    expect(cookies.find((c) => c.name === "better-auth.session_token")).toBeUndefined();
  });

  test("4. duplicate email cannot register twice", async ({ page }) => {
    const dup = email();
    await register(page, dup);
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
    await page.getByRole("button", { name: "Keluar" }).click();
    await expect(page).toHaveURL(/\/signin$/);

    // try registering the same email again
    await register(page, dup);
    await expect(page).toHaveURL(/\/signin$/);
    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible();
    const cookies = await page.context().cookies("http://localhost:3001");
    expect(cookies.find((c) => c.name === "better-auth.session_token")).toBeUndefined();
  });

  test("5. session cookie is HttpOnly", async ({ page }) => {
    await register(page, email());
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });

    const cookies = await page.context().cookies("http://localhost:3001");
    const session = cookies.find((c) => c.name === "better-auth.session_token");
    expect(session).toBeDefined();
    expect(session!.httpOnly).toBe(true);
  });

  test("6. logout invalidates session — dashboard no longer reachable", async ({ page }) => {
    await register(page, email());
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });

    await page.getByRole("button", { name: "Keluar" }).click();
    await expect(page).toHaveURL(/\/signin$/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/signin$/);
  });

  test("6b. orphaned session cookie (user deleted) is rejected, not a 500 or loop", async ({ page, context }) => {
    const userEmail = email();
    await register(page, userEmail);
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });

    const before = await context.cookies("http://localhost:3001");
    expect(before.find((c) => c.name === "better-auth.session_token")).toBeDefined();

    // simulate account deletion: drop the user (cascades to sessions) while the cookie survives
    const sql = postgres(process.env.DATABASE_URL!);
    await sql`delete from "user" where email = ${userEmail}`;
    await sql.end();

    // the stale cookie must NOT 500 or loop — clean redirect to /signin and cookie cleared
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/signin$/);
    await expect(page.getByLabel("Email")).toBeVisible();

    const after = await context.cookies("http://localhost:3001");
    expect(after.find((c) => c.name === "better-auth.session_token")).toBeUndefined();
  });

  test("7. cross-user isolation — user B cannot see user A data", async ({ page }) => {
    // user A: register, create budget, add expense
    await register(page, email());
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });

    await page.goto("/dashboard/budget");
    await page.getByLabel("Pendapatan Bulanan (take-home)").fill("10000000");
    await page.getByRole("button", { name: "Simpan Budget" }).click();
    await expect(page.getByText("Budget berhasil disimpan.")).toBeVisible();

    await page.goto("/dashboard/expenses");
    await page.getByRole("button", { name: "Tambah" }).click();
    await page.getByLabel("Kategori").selectOption("wants");
    await page.getByLabel("Jumlah (Rp)").fill("50000");
    await page.getByLabel("Deskripsi").fill("Rahasia user A");
    await page.getByRole("button", { name: "Simpan", exact: true }).click();
    await expect(page.getByText("Rahasia user A")).toBeVisible();

    await page.getByRole("button", { name: "Keluar" }).click();
    await expect(page).toHaveURL(/\/signin$/);

    // user B: fresh account sees no trace of A
    await register(page, email());
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });

    await expect(page.getByText("Belum ada budget")).toBeVisible();
    await expect(page.getByText("Rahasia user A")).toHaveCount(0);

    await page.goto("/dashboard/expenses");
    await expect(page.getByText("Belum ada pengeluaran")).toBeVisible();
    await expect(page.getByText("Rahasia user A")).toHaveCount(0);

    await page.goto("/dashboard/budget");
    await expect(page.getByLabel("Pendapatan Bulanan (take-home)")).toBeVisible();
  });
});