export const DEFAULT_HTML = `<div style="padding: 40px; text-align: center; font-family: system-ui, sans-serif;">
  <h1 style="font-size: 32px; color: #333; margin-bottom: 16px;">Hello, World!</h1>
  <p style="font-size: 16px; color: #666;">This is a preview of HTML to Image conversion.</p>
</div>`;

export const DEFAULT_CSS = `body {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}`;

export const FORMAT_OPTIONS = [
  { value: 'png' as const, label: 'PNG' },
  { value: 'jpg' as const, label: 'JPG' },
  { value: 'svg' as const, label: 'SVG' },
];
