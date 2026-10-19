import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AssistantText from './AssistantText.mjs';

const render = text => renderToStaticMarkup(createElement(AssistantText, { text }));

test('renders answer and citation Markdown, including nested formatting', () => {
  const html = render('### Tiêu chuẩn vận chuyển\n\n* **Giảm xóc (*Air Suspension*):** bắt buộc [6].\n  * Nghỉ **45 phút**.\n\n1. Kiểm tra `Booking ID`.\n2. Bàn giao.\n\n```text\n# giữ nguyên * trong code\n```\n\n[Nguồn](https://example.com)');
  assert.match(html, /<h3>Tiêu chuẩn vận chuyển<\/h3>/);
  assert.match(html, /<strong>Giảm xóc \(<em>Air Suspension<\/em>\):<\/strong>/);
  assert.match(html, /<ul>\s*<li>[\s\S]*<ul>\s*<li>Nghỉ <strong>45 phút<\/strong>\.<\/li>\s*<\/ul>/);
  assert.match(html, /<ol>\s*<li>Kiểm tra <code>Booking ID<\/code>\.<\/li>/);
  assert.match(html, /<pre><code class="language-text"># giữ nguyên \* trong code\n<\/code><\/pre>/);
  assert.match(html, /<a href="https:\/\/example.com">Nguồn<\/a>/);
  assert.ok(html.includes('[6]'));
});

test('keeps untrusted HTML inert and blocks unsafe Markdown links', () => {
  const html = render('<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n[unsafe](javascript:alert%281%29)');
  assert.doesNotMatch(html, /<script|<img[^>]*onerror|(?:href|src)="javascript:/i);
  assert.ok(html.includes('&lt;script&gt;'));
});
