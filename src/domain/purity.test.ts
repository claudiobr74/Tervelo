import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

describe("pureza do domínio", () => {
  it("não importa React, Next, GraphQL nem componentes", () => {
    const root = path.resolve("src/domain");
    const files = walk(root).filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"));
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/from ["']react/);
      expect(source, file).not.toMatch(/from ["']next/);
      expect(source, file).not.toMatch(/graphql/i);
      expect(source, file).not.toMatch(/from ["']@\/components/);
      expect(source, file).not.toMatch(/from ["']@\/lib\/nhost/);
    }
  });
});
