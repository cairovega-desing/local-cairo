// El ojo: dos lienzos WebGL (ojo + córnea) y, entre ellos, el wordmark VISSION en HTML.
// La cámara es perspectiva de verdad: el mismo cálculo dibuja el shader y ubica el wordmark,
// así nunca se separan de la pupila.
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './eye-shader.js';

const loader = new THREE.TextureLoader();
let texturesPromise = null;
let geometryPromise = null;

export function loadEyeAssets(base = 'assets/eye/') {
  if (!geometryPromise) geometryPromise = fetch(base + 'geometry.json').then((r) => r.json());
  if (!texturesPromise) {
    const load = (name) =>
      new Promise((resolve, reject) =>
        loader.load(base + name, (t) => {
          t.flipY = false;
          t.colorSpace = THREE.NoColorSpace;
          t.minFilter = THREE.LinearMipmapLinearFilter;
          t.magFilter = THREE.LinearFilter;
          t.generateMipmaps = true;
          t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
          t.anisotropy = 4;
          resolve(t);
        }, undefined, reject)
      );
    texturesPromise = Promise.all([load('open.webp'), load('closed.webp'), load('iris.webp')]).then(
      ([open, closed, iris]) => ({ open, closed, iris })
    );
  }
  return Promise.all([geometryPromise, texturesPromise]).then(([geometry, textures]) => ({ geometry, textures }));
}

const Z = new THREE.Vector3(0, 0, 1);
const tmpV = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();

export class Eye {
  constructor({ stage, canvas, cornea, clip, wordmark, assets, dprCap = 2, vignette = true, bg = [0.925, 0.937, 0.941] }) {
    this.stage = stage;
    this.canvas = canvas;
    this.corneaCanvas = cornea;
    this.clip = clip;
    this.wordmark = wordmark;
    this.geo = assets.geometry;
    this.dprCap = dprCap;
    this.w = 1;
    this.h = 1;
    this.dpr = 1;
    this.visible = true;
    this.textW = 0;
    this.textH = 0;
    this.wordmarkCap = Infinity;   // ancho máximo del wordmark en px de pantalla
    this.wordmarkRatio = 0.64;     // ancho del wordmark respecto al diámetro de la pupila

    // estado que anima el exterior
    this.state = {
      tx: this.geo.irisC[0], ty: this.geo.irisC[1], s: 1, rx: 0, ry: 0,
      pupil: 1, blink: 0, sweepX: -4, sweepA: 0, hiRot: 0, hiAmt: 1, detail: 0, grain: 0.012,
      floatY: 0,
    };
    this.gazeQ = new THREE.Quaternion();
    this.eyeballR = this.geo.irisR * 1.16;
    this.lidFollow = 0.26;

    const g = this.geo;
    const photo = [241 / 255, 240 / 255, 236 / 255];
    this.grade = new THREE.Vector3(bg[0] / photo[0], bg[1] / photo[1], bg[2] / photo[2]);
    const uniforms = () => ({
      uMode: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uFocal: { value: 1000 },
      uCamPos: { value: new THREE.Vector3() },
      uCamRot: { value: new THREE.Matrix3() },
      uView: { value: new THREE.Vector2() },
      uTime: { value: 0 },
      uOpen: { value: assets.textures.open },
      uClosed: { value: assets.textures.closed },
      uIris: { value: assets.textures.iris },
      uImg: { value: new THREE.Vector2(g.imgW, g.imgH) },
      uUp: { value: g.up },
      uLo: { value: g.lo },
      uCl: { value: g.cl },
      uCurveX: { value: new THREE.Vector2(g.x0, g.x1) },
      uIrisC: { value: new THREE.Vector2(g.irisC[0], g.irisC[1]) },
      uIrisR: { value: g.irisR },
      uPupilR: { value: g.pupilR },
      uIrisTexR: { value: g.irisTexR },
      uPupilTexR: { value: g.pupilTexR },
      uGaze: { value: new THREE.Vector2() },
      uFore: { value: new THREE.Vector3(0, 0, 1) },
      uLidShift: { value: 0 },
      uBlink: { value: 0 },
      uDetail: { value: 0 },
      uHiRot: { value: 0 },
      uSweep: { value: new THREE.Vector3(-4, 0, 0) },
      uHiAmt: { value: 1 },
      uVignette: { value: vignette ? 1 : 0 },
      uVigC: { value: new THREE.Vector2(850, 488) },
      uVigR: { value: new THREE.Vector2(790, 430) },
      uGrain: { value: 0.012 },
      uGrade: { value: this.grade },
      uBgCol: { value: new THREE.Vector3(bg[0], bg[1], bg[2]) },
    });

    this.passes = [];
    const make = (cv, mode) => {
      const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
      renderer.setClearColor(0x000000, 0);
      // el shader ya entrega color premultiplicado sobre un lienzo vacío: sin mezcla extra
      const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms: uniforms(), depthTest: false, depthWrite: false, blending: THREE.NoBlending });
      material.uniforms.uMode.value = mode;
      if (mode === 1) {
        // la córnea no necesita las fotos
        material.uniforms.uOpen.value = null;
        material.uniforms.uClosed.value = null;
        material.uniforms.uIris.value = null;
      }
      material.extensions = { derivatives: true };
      const scene = new THREE.Scene();
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.passes.push({ renderer, material, scene, camera });
    };
    make(canvas, 0);
    if (cornea) make(cornea, 1);

    // cámara (en px CSS)
    this.cam = { R: new THREE.Matrix3(), Rt: new THREE.Matrix3(), C: new THREE.Vector3(), f: 1000, m4: new THREE.Matrix4(), fwd: new THREE.Vector3(0, 0, 1) };
    this.gaze = { x: 0, y: 0, fx: 0, fy: 0, c: 1, lid: 0 };
    this.resize();
  }

  measureWordmark() {
    if (!this.wordmark) return;
    this.textW = this.wordmark.offsetWidth;
    this.textH = this.wordmark.offsetHeight;
  }

  resize() {
    const r = this.stage.getBoundingClientRect();
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    for (const p of this.passes) {
      p.renderer.setPixelRatio(this.dpr);
      p.renderer.setSize(this.w, this.h, false);
      p.material.uniforms.uRes.value.set(Math.round(this.w * this.dpr), Math.round(this.h * this.dpr));
    }
    this.measureWordmark();
  }

  // --- cámara ---------------------------------------------------------------
  updateCamera() {
    const st = this.state;
    const f = 1.12 * Math.max(this.h, this.w * 0.62);
    const D = f / st.s;
    tmpE.set(st.rx, st.ry, 0, 'XYZ');
    tmpQ.setFromEuler(tmpE);
    this.cam.m4.makeRotationFromQuaternion(tmpQ);
    this.cam.R.setFromMatrix4(this.cam.m4);
    this.cam.Rt.copy(this.cam.R).transpose();
    const fwd = this.cam.fwd.set(0, 0, 1).applyMatrix3(this.cam.R);
    this.cam.C.set(st.tx - D * fwd.x, st.ty + st.floatY / st.s - D * fwd.y, -D * fwd.z);
    this.cam.f = f;
  }

  // mundo → px CSS dentro del stage
  project(x, y, out = { x: 0, y: 0 }) {
    const c = this.cam;
    tmpV.set(x - c.C.x, y - c.C.y, -c.C.z).applyMatrix3(c.Rt);
    const z = Math.max(tmpV.z, 1e-3);
    out.x = (c.f * tmpV.x) / z + this.w / 2;
    out.y = (c.f * tmpV.y) / z + this.h / 2;
    return out;
  }

  // --- mirada (cuaterniones) -----------------------------------------------
  // yaw/pitch en radianes; alpha = cuánto acercarse al objetivo este frame
  lookTowards(yaw, pitch, alpha) {
    const fx = Math.sin(yaw) * Math.cos(pitch);
    const fy = Math.sin(pitch);
    const fz = Math.cos(yaw) * Math.cos(pitch);
    tmpV.set(fx, fy, fz).normalize();
    tmpQ.setFromUnitVectors(Z, tmpV);
    this.gazeQ.slerp(tmpQ, alpha);
  }

  computeGaze() {
    const f = tmpV.set(0, 0, 1).applyQuaternion(this.gazeQ);
    const len = Math.hypot(f.x, f.y);
    this.gaze.x = f.x * this.eyeballR;
    this.gaze.y = f.y * this.eyeballR;
    this.gaze.fx = len > 1e-5 ? f.x / len : 0;
    this.gaze.fy = len > 1e-5 ? f.y / len : 0;
    this.gaze.c = Math.max(0.6, f.z);
    this.gaze.lid = f.y * this.eyeballR * this.lidFollow * (f.y > 0 ? 1 : 0.55);
  }

  pupilRadius() {
    return this.geo.pupilR * this.state.pupil;
  }

  // --- dibujo ---------------------------------------------------------------
  render(time = 0) {
    if (!this.visible) return;
    const st = this.state;
    this.updateCamera();
    this.computeGaze();
    const c = this.cam;
    const fwd = c.fwd;
    for (const p of this.passes) {
      const u = p.material.uniforms;
      u.uFocal.value = c.f * this.dpr;
      u.uCamPos.value.copy(c.C);
      u.uCamRot.value.copy(c.R);
      u.uView.value.set(fwd.x, fwd.y);
      u.uTime.value = time;
      u.uPupilR.value = this.pupilRadius();
      u.uGaze.value.set(this.gaze.x, this.gaze.y);
      u.uFore.value.set(this.gaze.fx, this.gaze.fy, this.gaze.c);
      u.uLidShift.value = this.gaze.lid;
      u.uBlink.value = st.blink;
      u.uDetail.value = st.detail;
      u.uHiRot.value = st.hiRot;
      u.uSweep.value.set(st.sweepX, st.sweepA, 0);
      u.uHiAmt.value = st.hiAmt;
      u.uGrain.value = st.grain;
      p.renderer.render(p.scene, p.camera);
    }
    this.placeWordmark();
  }

  // El wordmark vive dentro de la pupila: mismo centro, misma escala, mismo escorzo.
  placeWordmark() {
    if (!this.wordmark || !this.textW) return;
    const g = this.geo;
    const icx = g.irisC[0] + this.gaze.x + this.cam.fwd.x * 0.16 * g.irisR;
    const icy = g.irisC[1] + this.gaze.y + this.cam.fwd.y * 0.16 * g.irisR;
    const p0 = this.project(icx, icy, {});
    const px = this.project(icx + 1, icy, {});
    const py = this.project(icx, icy + 1, {});
    // jacobiano mundo → pantalla
    let a = px.x - p0.x, b = px.y - p0.y, cc = py.x - p0.x, d = py.y - p0.y;
    // escorzo por la mirada: comprimir a lo largo de la dirección (fx, fy)
    const k = this.gaze.c;
    const fx = this.gaze.fx, fy = this.gaze.fy;
    const f00 = 1 - (1 - k) * fx * fx, f01 = -(1 - k) * fx * fy, f11 = 1 - (1 - k) * fy * fy;
    const A = a * f00 + cc * f01, B = b * f00 + d * f01, Cc = a * f01 + cc * f11, Dd = b * f01 + d * f11;
    const worldW = 2 * this.pupilRadius() * this.wordmarkRatio;
    const screenW = Math.hypot(A, B) * worldW;
    const cap = Math.min(1, this.wordmarkCap / Math.max(screenW, 1e-3));
    const sc = (worldW / this.textW) * cap;
    const m = [A * sc, B * sc, Cc * sc, Dd * sc];
    const ex = p0.x - (m[0] * this.textW) / 2 - (m[2] * this.textH) / 2;
    const ey = p0.y - (m[1] * this.textW) / 2 - (m[3] * this.textH) / 2;
    this.wordmark.style.transform = `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${ex},${ey})`;
    this.wordmarkScreenW = screenW * cap;
    this.updateClip(icx);
  }

  // recorta el wordmark con la abertura del ojo (párpados y parpadeo)
  updateClip(icx) {
    if (!this.clip) return;
    const g = this.geo;
    const st = this.state;
    const n = g.n;
    const xa = Math.max(g.x0, icx - 300), xb = Math.min(g.x1, icx + 300);
    const steps = 22;
    const top = [], bot = [];
    const pt = {};
    for (let i = 0; i <= steps; i++) {
      const x = xa + ((xb - xa) * i) / steps;
      const f = ((x - g.x0) / (g.x1 - g.x0)) * (n - 1);
      const i0 = Math.floor(f), i1 = Math.min(i0 + 1, n - 1), fr = f - i0;
      const up = g.up[i0] + (g.up[i1] - g.up[i0]) * fr;
      const lo = g.lo[i0] + (g.lo[i1] - g.lo[i0]) * fr;
      const cl = g.cl[i0] + (g.cl[i1] - g.cl[i0]) * fr;
      const xn = (x - g.x0) / (g.x1 - g.x0);
      const lid = this.gaze.lid * Math.sin(Math.PI * xn);
      const eU = up + lid + (cl - up - lid) * st.blink;
      const eL = lo + (cl - lo) * st.blink;
      this.project(x, eU, pt); top.push(`${pt.x.toFixed(1)}px ${pt.y.toFixed(1)}px`);
      this.project(x, eL, pt); bot.push(`${pt.x.toFixed(1)}px ${pt.y.toFixed(1)}px`);
    }
    this.clip.style.clipPath = `polygon(${top.concat(bot.reverse()).join(',')})`;
  }

  setVisible(v) {
    this.visible = v;
  }
}
