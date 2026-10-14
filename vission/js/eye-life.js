// Lo que hace que el ojo parezca vivo: mirada, parpadeo y pupila.
// Corre en su propio bucle, pero solo cuando `alive` es verdadero.

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInQuad = (t) => t * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// estado compartido del puntero / giroscopio (una sola escucha para todos los ojos)
const input = {
  x: 0, y: 0, active: false, fine: matchMedia('(pointer: fine)').matches,
  tilt: null, tiltBase: null,
};
let listening = false;
function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
      input.x = e.clientX; input.y = e.clientY; input.active = true; input.fine = true;
    }
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { input.active = false; });
  window.addEventListener('blur', () => { input.active = false; });

  const onTilt = (e) => {
    if (e.beta == null || e.gamma == null) return;
    if (!input.tiltBase) input.tiltBase = { b: e.beta, g: e.gamma };
    // la base se acomoda despacio a cómo sostiene el teléfono la persona
    input.tiltBase.b = lerp(input.tiltBase.b, e.beta, 0.004);
    input.tiltBase.g = lerp(input.tiltBase.g, e.gamma, 0.004);
    input.tilt = { b: e.beta - input.tiltBase.b, g: e.gamma - input.tiltBase.g, t: performance.now() };
  };
  const startTilt = () => window.addEventListener('deviceorientation', onTilt, { passive: true });
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    // iOS: hay que pedir permiso con un gesto
    const ask = () => {
      DeviceOrientationEvent.requestPermission().then((s) => { if (s === 'granted') startTilt(); }).catch(() => {});
      window.removeEventListener('touchend', ask);
    };
    window.addEventListener('touchend', ask, { once: true });
  } else if (typeof DeviceOrientationEvent !== 'undefined') {
    startTilt();
  }
}

export class EyeLife {
  constructor(eye, { reduced = false, maxYaw = 0.40, maxPitch = 0.25, blinkEvery = 20000, blinkJitter = 2000 } = {}) {
    listen();
    this.eye = eye;
    this.reduced = reduced;
    this.maxYaw = maxYaw;
    this.maxPitch = maxPitch;
    this.blinkEvery = blinkEvery;
    this.blinkJitter = blinkJitter;
    this.alive = false;
    this.yaw = 0; this.pitch = 0;
    this.nextBlink = Infinity;
    this.blinkStart = -1;
    this.blink = 0;
    this.focus = 1;          // contracción al "enfocar"
    this.focusTarget = 1;
    this.hover = 1;          // dilatación al pasar por el CTA
    this.hoverTarget = 1;
    this.wander = { t: 0, yaw: 0, pitch: 0 };
    this.floatAmp = 0;
  }

  setAlive(v, now = performance.now()) {
    if (v === this.alive) return;
    this.alive = v;
    if (v) {
      // el gran momento: la pupila enfoca, y al segundo, el primer parpadeo
      this.focus = 1.06;
      this.focusTarget = 0.9;
      setTimeout(() => { this.focusTarget = 0.95; }, 900);
      this.nextBlink = now + 1000;
    } else {
      this.nextBlink = Infinity;
      this.focusTarget = 1;
    }
  }

  setHover(v) { this.hoverTarget = v ? 1.16 : 1; }

  triggerBlink(now = performance.now()) {
    if (this.blinkStart < 0) this.blinkStart = now;
  }

  // dt en segundos
  update(now, dt) {
    const eye = this.eye;
    const k = (base) => 1 - Math.pow(1 - base, dt * 60);

    // --- objetivo de la mirada ---
    let ty = 0, tp = 0, rate = 0.05;
    if (this.alive && !this.reduced) {
      const fresh = input.tilt && now - input.tilt.t < 1500;
      if (input.fine && input.active) {
        const c = eye.project(eye.geo.irisC[0], eye.geo.irisC[1], {});
        const r = eye.stage.getBoundingClientRect();
        const dx = input.x - (r.left + c.x);
        const dy = input.y - (r.top + c.y);
        const depth = Math.max(520, eye.w * 0.5);
        ty = this.maxYaw * Math.tanh(Math.atan2(dx, depth) / this.maxYaw);
        tp = this.maxPitch * Math.tanh(Math.atan2(dy, depth) / this.maxPitch);
        rate = 0.1;
      } else if (!input.fine && fresh) {
        ty = clamp(input.tilt.g / 30, -1, 1) * this.maxYaw * 0.85;
        tp = clamp(input.tilt.b / 30, -1, 1) * this.maxPitch * 0.85;
        rate = 0.08;
      } else if (!input.fine) {
        // sin cursor ni giroscopio: mira despacio a su alrededor
        if (now > this.wander.t) {
          const center = Math.random() < 0.3;
          this.wander.yaw = center ? 0 : (Math.random() * 2 - 1) * this.maxYaw * 0.7;
          this.wander.pitch = center ? 0 : (Math.random() * 2 - 1) * this.maxPitch * 0.55;
          this.wander.t = now + 2200 + Math.random() * 2600;
        }
        ty = this.wander.yaw; tp = this.wander.pitch; rate = 0.09;
      }
    }
    eye.lookTowards(ty, tp, k(rate));

    // --- parpadeo ---
    if (this.alive && now >= this.nextBlink) {
      this.triggerBlink(now);
      this.nextBlink = now + this.blinkEvery + (Math.random() * 2 - 1) * this.blinkJitter;
    }
    if (this.blinkStart >= 0) {
      const t = now - this.blinkStart;
      if (t < 100) this.blink = easeInQuad(t / 100);
      else if (t < 150) this.blink = 1;
      else if (t < 300) this.blink = 1 - easeOutCubic((t - 150) / 150);
      else { this.blink = 0; this.blinkStart = -1; }
    }

    // --- pupila ---
    this.focus = lerp(this.focus, this.focusTarget, k(0.04));
    this.hover = lerp(this.hover, this.hoverTarget, k(0.05));
    const hippus = 1 + 0.012 * Math.sin(now * 0.0011) + 0.006 * Math.sin(now * 0.0029 + 1.3);

    // --- flotación suave ---
    this.floatAmp = lerp(this.floatAmp, this.alive && !this.reduced ? 4 : 0, k(0.02));

    return {
      blink: this.blink,
      pupil: this.focus * this.hover * (this.alive ? hippus : 1),
      floatY: Math.sin(now * 0.0009) * this.floatAmp,
    };
  }
}
