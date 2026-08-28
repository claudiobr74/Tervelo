import { describe, expect, it } from "vitest";
import { htmlToPlainText, stripLeadStrong } from "./description-text.mjs";

describe("htmlToPlainText", () => {
  it("tira o título em strong e as tags, preserva parágrafos", () => {
    const html = `<div>
<p><strong>Agachamento</strong></p>
<p>O agachamento é um exercício de força.</p>
<br>
<p>Use técnica correta.</p>
</div>`;
    expect(stripLeadStrong(html)).not.toMatch(/<strong>/);
    const text = htmlToPlainText(html);
    expect(text).toContain("O agachamento é um exercício de força.");
    expect(text).toContain("Use técnica correta.");
    expect(text).not.toContain("<p>");
    expect(text).not.toContain("Agachamento\n");
  });

  it("decodifica entidades simples", () => {
    expect(htmlToPlainText("força &amp; mobilidade")).toBe("força & mobilidade");
  });
});
