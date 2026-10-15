export function luminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map(v => parseInt(v, 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
export function contrast(a, b) {
  const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (hi + 0.05) / (lo + 0.05);
}
export function ink(background) {
  return contrast('#ffffff', background) > contrast('#141414', background) ? '#ffffff' : '#141414';
}
export function choose(ramp, preferred, backgrounds, minimum) {
  const candidates = Object.entries(ramp).filter(([, color]) => backgrounds.every(bg => contrast(color, bg) >= minimum));
  candidates.sort(([a], [b]) => Math.abs(Number(a) - preferred) - Math.abs(Number(b) - preferred));
  if (!candidates.length) throw new Error(`No shade meets ${minimum}: ${backgrounds}`);
  return candidates[0][1];
}
