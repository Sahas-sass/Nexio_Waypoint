import { buildStopMapHtml, toInlineScriptJson } from './stopMapHtml';

const store = { latitude: 6.8724, longitude: 79.8895 };

describe('toInlineScriptJson', () => {
  it('escapes characters that could close the script tag', () => {
    const out = toInlineScriptJson({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({ name: '</script><script>alert(1)</script>' });
  });

  it('escapes ampersands and line separators', () => {
    const out = toInlineScriptJson('a&b\u2028c');
    expect(out).not.toContain('&');
    expect(out).not.toContain('\u2028');
    expect(JSON.parse(out)).toBe('a&b\u2028c');
  });
});

describe('buildStopMapHtml', () => {
  it('embeds the store position and name', () => {
    const html = buildStopMapHtml({ store, storeName: 'Fresh Store #22', driver: null });
    expect(html).toContain('"store":[6.8724,79.8895]');
    expect(html).toContain('"storeName":"Fresh Store #22"');
    expect(html).toContain('"driver":null');
    expect(html).toContain('tile.openstreetmap.org');
  });

  it('includes the driver and a route line when the driver position is known', () => {
    const html = buildStopMapHtml({ store, storeName: 'S', driver: { latitude: 6.9, longitude: 79.86 } });
    expect(html).toContain('"driver":[6.9,79.86]');
    expect(html).toContain('L.polyline');
  });

  it('ignores an invalid driver position', () => {
    const html = buildStopMapHtml({ store, storeName: 'S', driver: { latitude: Number.NaN, longitude: 200 } });
    expect(html).toContain('"driver":null');
  });

  it('does not let a malicious store name break out of the script', () => {
    const html = buildStopMapHtml({ store, storeName: '</script><img src=x onerror=alert(1)>', driver: null });
    expect(html).not.toContain('<img src=x');
    expect(html.match(/<\/script>/g)).toHaveLength(2); // only Leaflet's tag and ours
    expect(html).toContain('tip.textContent = data.storeName');
  });

  it('loads Leaflet with integrity hashes', () => {
    const html = buildStopMapHtml({ store, storeName: 'S', driver: null });
    expect(html).toMatch(/leaflet\.js" integrity="sha256-/);
    expect(html).toMatch(/leaflet\.css" integrity="sha256-/);
  });

  it('rejects invalid store coordinates', () => {
    expect(() => buildStopMapHtml({ store: { latitude: 120, longitude: 0 }, storeName: 'S', driver: null })).toThrow(
      'Invalid store coordinates'
    );
  });
});
