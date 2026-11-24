import { COLORS, roundedRect } from './text.js';
import { levels, saveLevels } from '../audio/levels.js';

// Einstellungen: Zahnrad oben rechts (neben dem Notizbuch). Darin: Lösungsweg zeigen, Ton an/aus,
// Musik an/aus und je ein Regler für Stimmen, Musik und Effekte. Gespeichert in src/audio/levels.js.

const SANS = '"Trebuchet MS", "Avenir Next", "Segoe UI", system-ui, sans-serif';
const GEAR = { x: 1128, y: 20, size: 56 };
const PANEL = { x: 870, y: 88, width: 390, height: 0 }; // Höhe ergibt sich aus den Zeilen
const ROW = 50;
const SLIDER = { x: PANEL.x + 130, width: 190 };

export class Settings {
  constructor(game) {
    this.game = game;
    this.isOpen = false;
    this.dragging = null; // Name des Reglers, der gerade gezogen wird
    this.mouse = { x: -1, y: -1 };
  }

  // Zeilen des Menüs (Lösungsweg nur im Wagen)
  rows() {
    const rows = [];
    if (!this.game.inCalendar) rows.push({ kind: 'hint', label: 'Tipp / Lösungsweg (H)' });
    rows.push(
      { kind: 'toggle', key: 'sound', label: 'Ton (M)' },
      { kind: 'toggle', key: 'music', label: 'Musik' },
      { kind: 'slider', key: 'voices', label: 'Stimmen' },
      { kind: 'slider', key: 'musicVolume', label: 'Musik' },
      { kind: 'slider', key: 'effects', label: 'Effekte' },
    );
    if (!this.game.inCalendar) rows.push({ kind: 'leave', label: 'Zur Wagenübersicht' });
    let y = PANEL.y + 64;
    for (const row of rows) {
      row.y = y;
      y += ROW;
    }
    return { rows, height: y - PANEL.y + 8 };
  }

  gearContains(p) {
    return p.x >= GEAR.x && p.x <= GEAR.x + GEAR.size && p.y >= GEAR.y && p.y <= GEAR.y + GEAR.size;
  }

  panelContains(p) {
    const { height } = this.rows();
    return p.x >= PANEL.x && p.x <= PANEL.x + PANEL.width && p.y >= PANEL.y && p.y <= PANEL.y + height;
  }

  // Liegt der Punkt auf dem Zahnrad oder dem offenen Menü?
  contains(p) {
    return this.gearContains(p) || (this.isOpen && this.panelContains(p));
  }

  get hintPossible() {
    const game = this.game;
    return !game.inCalendar && !game.story?.inCutscene && !game.story?.isBusy && !game.overlay.blocksInput;
  }

  labelAt(p) {
    if (this.gearContains(p)) return this.isOpen ? 'Einstellungen schließen' : 'Einstellungen';
    return '';
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.dragging = null;
    this.leaveArmed = false;
  }

  close() {
    this.isOpen = false;
    this.dragging = null;
    this.leaveArmed = false;
  }

  // Ergebnis true = der Klick gehörte zum Menü
  handleClick(p) {
    if (this.gearContains(p)) {
      this.toggle();
      return true;
    }
    if (!this.isOpen) return false;
    if (!this.panelContains(p)) {
      this.close(); // Klick daneben schließt nur das Menü
      return true;
    }
    if (p.x >= PANEL.x + PANEL.width - 44 && p.y <= PANEL.y + 44) {
      this.close();
      return true;
    }
    const row = this.rows().rows.find((r) => p.y >= r.y - ROW / 2 && p.y < r.y + ROW / 2);
    if (!row) return true;
    if (row.kind === 'hint' && this.hintPossible) {
      this.close();
      this.game.notebook.close();
      this.game.view?.close();
      this.game.story.hint();
    }
    if (row.kind === 'leave') {
      // Zweimal klicken: Der Wagen beginnt beim nächsten Mal von vorn (Spielstand der geschafften Türen bleibt)
      if (this.leaveArmed) leaveWagon();
      else this.leaveArmed = true;
    }
    if (row.kind === 'toggle') this.set(row.key, !this.value(row.key));
    if (row.kind === 'slider') {
      this.dragging = row.key;
      this.slide(p.x);
    }
    return true;
  }

  pointerUp() {
    this.dragging = null;
  }

  value(key) {
    return key === 'sound' ? !this.game.sound.muted : levels[key];
  }

  set(key, value) {
    if (key === 'sound') {
      if (this.game.sound.muted === value) this.game.sound.toggleMute();
      return;
    }
    levels[key] = value;
    saveLevels();
    this.game.sound.applyLevels();
  }

  slide(x) {
    const value = Math.min(1, Math.max(0, (x - SLIDER.x) / SLIDER.width));
    this.set(this.dragging, Math.round(value * 20) / 20);
  }

  update(dt, mouse) {
    this.mouse = mouse;
    if (this.dragging) this.slide(mouse.x);
  }

  // ---------------------------------------------------------------- Zeichnen
  draw(ctx) {
    this.drawGear(ctx, this.gearContains(this.mouse) || this.isOpen);
    if (this.isOpen) this.drawPanel(ctx);
  }

  drawGear(ctx, hovered) {
    const cx = GEAR.x + GEAR.size / 2, cy = GEAR.y + GEAR.size / 2;
    const r = GEAR.size / 2 - (hovered ? 2 : 5);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    const teeth = 8;
    for (let i = 0; i < teeth * 2; i++) {
      const outer = i % 2 === 0;
      const a0 = (i / (teeth * 2)) * Math.PI * 2;
      const a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
      const rr = outer ? r : r * 0.78;
      ctx.arc(0, 0, rr, a0 + (outer ? 0.06 : 0), a1 - (outer ? 0.06 : 0));
    }
    ctx.closePath();
    const metal = ctx.createLinearGradient(0, -r, 0, r);
    metal.addColorStop(0, '#f0c769');
    metal.addColorStop(1, '#9a6a22');
    ctx.fillStyle = metal;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3a2410';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = '#2a1a0e';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawPanel(ctx) {
    const { rows, height } = this.rows();
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    roundedRect(ctx, PANEL.x, PANEL.y, PANEL.width, height, 12);
    ctx.fillStyle = 'rgba(24, 14, 8, 0.95)';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.85)';
    ctx.stroke();

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.brass;
    ctx.font = `bold 22px ${SANS}`;
    ctx.fillText('Einstellungen', PANEL.x + 22, PANEL.y + 28);

    // Schließen-Kreuz
    const close = this.mouse.x >= PANEL.x + PANEL.width - 44 && this.mouse.x <= PANEL.x + PANEL.width && this.mouse.y >= PANEL.y && this.mouse.y <= PANEL.y + 44;
    ctx.strokeStyle = close ? '#fff' : 'rgba(243, 226, 191, 0.7)';
    ctx.lineWidth = 2.5;
    const kx = PANEL.x + PANEL.width - 28, ky = PANEL.y + 28;
    ctx.beginPath();
    ctx.moveTo(kx - 7, ky - 7); ctx.lineTo(kx + 7, ky + 7);
    ctx.moveTo(kx + 7, ky - 7); ctx.lineTo(kx - 7, ky + 7);
    ctx.stroke();

    for (const row of rows) {
      const hovered = this.mouse.x >= PANEL.x && this.mouse.x <= PANEL.x + PANEL.width && this.mouse.y >= row.y - ROW / 2 && this.mouse.y < row.y + ROW / 2;
      if (row.kind === 'hint') this.drawHint(ctx, row, hovered);
      else if (row.kind === 'leave') this.drawButton(ctx, row, hovered, this.leaveArmed ? 'Wirklich? Der Wagen beginnt dann von vorn' : row.label);
      else {
        ctx.fillStyle = '#f3e2bf';
        ctx.font = `18px ${SANS}`;
        ctx.textAlign = 'left';
        ctx.fillText(row.label, PANEL.x + 22, row.y);
        if (row.kind === 'toggle') this.drawToggle(ctx, row, hovered);
        else this.drawSlider(ctx, row);
      }
    }
    ctx.restore();
  }

  drawHint(ctx, row, hovered) {
    const possible = this.hintPossible;
    const x = PANEL.x + 18, w = PANEL.width - 36, h = 36;
    roundedRect(ctx, x, row.y - h / 2, w, h, 8);
    ctx.fillStyle = !possible ? 'rgba(80, 70, 60, 0.5)' : hovered ? 'rgba(217, 164, 65, 0.95)' : 'rgba(217, 164, 65, 0.75)';
    ctx.fill();
    ctx.fillStyle = possible ? '#2a1a0e' : 'rgba(243, 226, 191, 0.5)';
    ctx.font = `bold 18px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(possible ? row.label : 'Tipp – gerade nicht möglich', x + w / 2, row.y + 1);
  }

  drawButton(ctx, row, hovered, label) {
    const x = PANEL.x + 18, w = PANEL.width - 36, h = 36;
    roundedRect(ctx, x, row.y - h / 2, w, h, 8);
    ctx.fillStyle = hovered ? 'rgba(120, 60, 50, 0.95)' : 'rgba(90, 45, 38, 0.85)';
    ctx.fill();
    ctx.fillStyle = '#f3e2bf';
    ctx.font = `bold ${label.length > 30 ? 15 : 18}px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, row.y + 1);
  }

  drawToggle(ctx, row, hovered) {
    const on = this.value(row.key);
    const w = 62, h = 30, x = SLIDER.x + SLIDER.width - w, y = row.y - h / 2;
    roundedRect(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = on ? (hovered ? '#e8b44f' : COLORS.brass) : hovered ? '#6a5a4a' : '#4a3c30';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(on ? x + w - h / 2 : x + h / 2, row.y, h / 2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f7ecd2';
    ctx.fill();
    ctx.fillStyle = on ? '#f3e2bf' : 'rgba(243, 226, 191, 0.6)';
    ctx.font = `15px ${SANS}`;
    ctx.textAlign = 'right';
    ctx.fillText(on ? 'an' : 'aus', x - 12, row.y + 1);
  }

  drawSlider(ctx, row) {
    const value = this.value(row.key);
    const muted = this.game.sound.muted || (row.key === 'musicVolume' && !levels.music);
    const y = row.y;
    roundedRect(ctx, SLIDER.x, y - 4, SLIDER.width, 8, 4);
    ctx.fillStyle = '#4a3c30';
    ctx.fill();
    roundedRect(ctx, SLIDER.x, y - 4, Math.max(8, SLIDER.width * value), 8, 4);
    ctx.fillStyle = muted ? '#7a6a58' : COLORS.brass;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(SLIDER.x + SLIDER.width * value, y, this.dragging === row.key ? 12 : 10, 0, Math.PI * 2);
    ctx.fillStyle = '#f7ecd2';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3a2410';
    ctx.stroke();
    ctx.fillStyle = 'rgba(243, 226, 191, 0.75)';
    ctx.font = `14px ${SANS}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(value * 100)} %`, SLIDER.x + SLIDER.width + 14, y + 1);
  }
}

// Zurück zur Wagenübersicht: Seite neu laden (ohne ?tuer), so beginnt der Wagen sauber von vorn
function leaveWagon() {
  const params = new URLSearchParams(location.search);
  for (const key of ['tuer', 'wagen', 'skipintro']) params.delete(key);
  const query = params.toString().replace(/=(&|$)/g, '$1');
  location.href = location.pathname + (query ? `?${query}` : '');
}
