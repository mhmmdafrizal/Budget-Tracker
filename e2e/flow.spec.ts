import { test, expect } from "@playwright/test";

const INCOME = "10000000";
const EMAIL = `budget-flow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
const PASSWORD = "TestingPass123!";
const AMOUNT1 = "50000";
const AMOUNT2 = "75000";

test.describe("50-30-20 budget tracker e2e flow", () => {
  test("full user journey", async ({ page }) => {
    test.setTimeout(300_000);
    page.on("dialog", (d) => d.accept());

    // 1. Unauthenticated guard: all non-public routes redirect to /signin
    for (const path of ["/", "/dashboard", "/dashboard/budget", "/dashboard/expenses"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/signin$/);
    }

    // 2. Sign up
    await page.getByRole("button", { name: "Daftar" }).click();
    await page.getByLabel("Nama Lengkap").fill("Playwright User");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Daftar", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });

    // 3. Empty state
    await expect(page.getByText("Belum ada budget")).toBeVisible();
    await expect(page.getByRole("link", { name: "Atur Budget" })).toBeVisible();

    // 4. Create budget (50-30-20 auto-split of 10.000.000)
    await page.goto("/dashboard/budget");
    await page.getByLabel("Pendapatan Bulanan (take-home)").fill(INCOME);
    await expect(page.getByText("5.000.000", { exact: false })).toBeVisible();
    await expect(page.getByText("3.000.000", { exact: false })).toBeVisible();
    await expect(page.getByText("2.000.000", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Simpan Budget" }).click();
    await expect(page.getByText("Budget berhasil disimpan.")).toBeVisible();

    // 4b. Reload -> summary section renders (form doesn't router.refresh)
    await page.reload();
    await expect(page.getByText("Kebutuhan (50%)")).toBeVisible();
    await expect(page.getByText(/Sisa Rp/).first()).toBeVisible();

    // 5. Dashboard reflects the budget
    await page.goto("/dashboard");
    await expect(page.getByText("10.000.000", { exact: false })).toBeVisible();
    await expect(page.getByText("Alokasi vs Pengeluaran")).toBeVisible();

    // 6. Add an expense (wants, 50.000)
    await page.goto("/dashboard/expenses");
    await page.getByRole("button", { name: "Tambah" }).click();
    await page.getByLabel("Kategori").selectOption("wants");
    await page.getByLabel("Jumlah (Rp)").fill(AMOUNT1);
    await page.getByLabel("Deskripsi").fill("Beli kopi");
    await page.getByRole("button", { name: "Simpan", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByText("Beli kopi")).toBeVisible();
    await expect(page.getByText("50.000", { exact: false }).first()).toBeVisible();

    // 7. Dashboard math: wants remaining = 3.000.000 - 50.000
    await page.goto("/dashboard");
    await expect(page.getByText("2.950.000", { exact: false })).toBeVisible();

    // 8. Edit expense -> 75.000
    await page.goto("/dashboard/expenses");
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Jumlah (Rp)").fill(AMOUNT2);
    await page.getByRole("button", { name: "Simpan Perubahan" }).click();
    await expect(page.getByText("75.000", { exact: false }).first()).toBeVisible();

    // 9. Delete expense -> empty state
    await page.getByLabel("Hapus").click();
    await page.getByRole("dialog").getByRole("button", { name: "Hapus" }).click();
    await expect(page.getByText("Belum ada pengeluaran")).toBeVisible();

    // 10. Logout
    await page.getByRole("button", { name: "Keluar" }).click();
    await expect(page).toHaveURL(/\/signin$/);

    // 11. Login persists data
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Masuk", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
    await expect(page.getByText("10.000.000", { exact: false })).toBeVisible();
    await expect(page.getByText("5.000.000", { exact: false }).first()).toBeVisible();
  });
});