import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";

const targetUrl = process.env.A11Y_URL ?? "http://localhost:3000";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const summary = {
    targetUrl,
    violations: results.violations.map(({ id, impact, help, nodes }) => ({ id, impact, help, instances: nodes.length })),
    passes: results.passes.length,
    incomplete: results.incomplete.length,
  };
  console.log(JSON.stringify(summary, null, 2));
  process.exitCode = results.violations.length ? 1 : 0;
  await context.close();
} finally {
  await browser.close();
}
