// Shader del ojo. Un solo programa con dos pasadas:
//   uMode = 0 → ojo (piel, párpados, esclerótica, iris, pupila, parpadeo)
//   uMode = 1 → córnea (solo los brillos especulares, va POR ENCIMA del wordmark HTML)
// Coordenadas de mundo = píxeles de la foto original (1671 × 941).
// La cámara es una cámara perspectiva real que mira al plano z = 0,
// así el zoom, la inclinación y la proyección del wordmark salen de la misma matemática.

export const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  #define N_CURVE 64

  uniform int   uMode;
  uniform vec2  uRes;        // tamaño del buffer (px reales)
  uniform float uFocal;      // focal en px reales
  uniform vec3  uCamPos;     // posición de la cámara (mundo)
  uniform mat3  uCamRot;     // cámara → mundo
  uniform vec2  uView;       // seno de la inclinación (para la paralaje del iris)
  uniform float uTime;

  uniform sampler2D uOpen;   // ojo sin iris (esclerótica + párpados + piel)
  uniform sampler2D uClosed; // ojo cerrado
  uniform sampler2D uIris;   // iris en macro
  uniform vec2  uImg;        // 1671, 941

  uniform float uUp[N_CURVE];
  uniform float uLo[N_CURVE];
  uniform float uCl[N_CURVE];
  uniform vec2  uCurveX;     // x0, x1

  uniform vec2  uIrisC;      // centro del iris en reposo
  uniform float uIrisR;
  uniform float uPupilR;     // radio actual de la pupila (dilatación incluida)
  uniform float uIrisTexR;
  uniform float uPupilTexR;
  uniform vec2  uGaze;       // desplazamiento del iris por la mirada (mundo)
  uniform vec3  uFore;       // xy = dirección de la mirada, z = coseno (escorzo)
  uniform float uLidShift;   // el párpado superior acompaña la mirada
  uniform float uBlink;      // 0 abierto · 1 cerrado
  uniform float uDetail;     // detalle procedural extra en macro
  uniform float uHiRot;      // giro del reflejo principal durante el zoom
  uniform vec3  uSweep;      // x = posición del barrido de la intro, y = intensidad
  uniform float uHiAmt;      // intensidad de los reflejos de la córnea
  uniform float uVignette;   // 1 = la piel se funde a transparente
  uniform vec2  uVigC;
  uniform vec2  uVigR;
  uniform float uGrain;
  uniform vec3  uGrade;      // corrige la foto hacia el color del fondo
  uniform vec3  uBgCol;      // color del fondo de la escena

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float hash13(vec3 p3) {
    p3 = fract(p3 * 0.1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
  }
  float vnoise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    float n000 = hash13(i);
    float n100 = hash13(i + vec3(1, 0, 0));
    float n010 = hash13(i + vec3(0, 1, 0));
    float n110 = hash13(i + vec3(1, 1, 0));
    float n001 = hash13(i + vec3(0, 0, 1));
    float n101 = hash13(i + vec3(1, 0, 1));
    float n011 = hash13(i + vec3(0, 1, 1));
    float n111 = hash13(i + vec3(1, 1, 1));
    return mix(mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
               mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y), u.z);
  }

  float curveIdx(float x) {
    return clamp((x - uCurveX.x) / (uCurveX.y - uCurveX.x), 0.0, 1.0) * float(N_CURVE - 1);
  }
  float curveUp(float x) { float f = curveIdx(x); int i = int(floor(f)); int j = min(i + 1, N_CURVE - 1); return mix(uUp[i], uUp[j], fract(f)); }
  float curveLo(float x) { float f = curveIdx(x); int i = int(floor(f)); int j = min(i + 1, N_CURVE - 1); return mix(uLo[i], uLo[j], fract(f)); }
  float curveCl(float x) { float f = curveIdx(x); int i = int(floor(f)); int j = min(i + 1, N_CURVE - 1); return mix(uCl[i], uCl[j], fract(f)); }

  vec3 texOpen(vec2 p)   { return texture2D(uOpen,   p / uImg).rgb; }
  vec3 texClosed(vec2 p) { return texture2D(uClosed, p / uImg).rgb; }

  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  void main() {
    // ---- rayo de cámara → plano del ojo -------------------------------
    vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
    vec3 dir = uCamRot * vec3((frag - 0.5 * uRes) / uFocal, 1.0);
    float t = -uCamPos.z / dir.z;
    vec2 P = uCamPos.xy + t * dir.xy;
    float aa = max(fwidth(P.x), fwidth(P.y));   // tamaño del píxel en mundo

    // ---- curvas de párpados --------------------------------------------
    float x = P.x;
    float xn = clamp((x - uCurveX.x) / (uCurveX.y - uCurveX.x), 0.0, 1.0);
    float xIn = smoothstep(uCurveX.x - 2.0, uCurveX.x + 8.0, x) * (1.0 - smoothstep(uCurveX.y - 8.0, uCurveX.y + 2.0, x));
    float up0 = curveUp(x);
    float lo0 = curveLo(x);
    float cl  = curveCl(x);

    // el párpado superior acompaña la mirada (más en el centro, nada en las comisuras)
    float lid = uLidShift * sin(3.14159 * xn);
    float wLid = smoothstep(up0 - 200.0, up0 - 15.0, P.y) * (1.0 - smoothstep(up0 + 6.0, up0 + 70.0, P.y));
    float yw = P.y - lid * wLid;
    vec2 Pw = vec2(x, yw);

    float e = max(2.0, aa * 0.9);
    float b = uBlink;
    float eU = mix(up0 + lid, cl, b);
    float eL = mix(lo0, cl, b);
    float opening = smoothstep(eU - e, eU + e, P.y) * (1.0 - smoothstep(eL - e, eL + e, P.y)) * xIn;

    // ---- iris ------------------------------------------------------------
    vec2 ic = uIrisC + uGaze + uView * (0.16 * uIrisR);
    vec2 v = P - ic;
    float along = dot(v, uFore.xy);
    v += uFore.xy * along * (1.0 / max(uFore.z, 0.6) - 1.0);
    float rl = length(v);
    float r = rl / uIrisR;
    vec2 d2 = rl > 1e-4 ? v / rl : vec2(0.0);
    float aaR = aa / uIrisR;

    if (uMode == 1) {
      // ================= CÓRNEA: solo brillos =================
      vec2 hc = uIrisC + uGaze * 0.14 - uView * (0.22 * uIrisR);
      vec2 q = (P - hc) / uIrisR;
      float rq = length(q);
      float aq = atan(q.y, q.x);
      float hi = 0.0;

      // ventana curva (softbox) arriba a la izquierda: el reflejo grande y suave del estudio
      float a0 = -2.66 + uHiRot, a1 = -1.80 + uHiRot;
      float band = smoothstep(0.46, 0.53, rq) * (1.0 - smoothstep(0.74, 0.86, rq));
      float ang  = smoothstep(a0, a0 + 0.16, aq) * (1.0 - smoothstep(a1 - 0.16, a1, aq));
      float mull = 1.0 - 0.55 * exp(-pow((aq - mix(a0, a1, 0.5)) / 0.02, 2.0));
      float grad = mix(1.0, 0.45, smoothstep(0.5, 0.85, rq));
      hi += 0.36 * band * ang * mull * grad;

      // reflejo principal: un rectángulo chico, redondeado y apenas curvo (una ventana)
      vec2 sp = vec2(-0.28 + uHiRot * 0.25, -0.33);
      vec2 dq = q - sp;
      dq = mat2(0.94, 0.34, -0.34, 0.94) * dq;
      dq.y += dq.x * dq.x * 1.6;
      vec2 hb = vec2(0.074, 0.052);
      vec2 dd = abs(dq) - hb + 0.024;
      float rr = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0) - 0.024;
      float soft = 0.009 + aaR * 1.2;
      float win = 1.0 - smoothstep(-soft, soft, rr);
      float bar = 1.0 - 0.45 * (1.0 - smoothstep(0.002, 0.007 + aaR, abs(dq.x))) * win;
      hi += 0.72 * win * bar * mix(1.0, 0.75, smoothstep(-0.05, 0.05, dq.y));
      hi += 0.12 * exp(-dot(dq, dq) / 0.012);

      // punto de relleno abajo a la derecha
      float df = length(q - vec2(0.40, 0.31));
      hi += 0.30 * (1.0 - smoothstep(0.008 - aaR, 0.02 + aaR, df));

      // brillo húmedo general de la cúpula
      float dome = 1.0 - smoothstep(0.85, 1.08, rq);
      hi += 0.06 * dome * (1.0 - smoothstep(0.0, 1.0, length(q - vec2(-0.45, -0.55))));
      // anillo de luz casi imperceptible en el borde de la córnea
      hi += 0.035 * exp(-pow((rq - 0.98) / 0.03, 2.0));

      hi *= uHiAmt;

      // barrido curvo de la intro (estamos dentro de la pupila)
      if (uSweep.y > 0.001) {
        vec2 qp = (P - ic) / uPupilR;
        vec2 c = vec2(uSweep.x, 2.6);
        float dd = length(qp - c) - 2.9;
        float arc = exp(-pow(dd / 0.10, 2.0)) * 0.55 + exp(-pow(dd / 0.32, 2.0)) * 0.10;
        arc *= exp(-pow((qp.x - uSweep.x * 0.85) / 1.4, 2.0));
        hi += arc * uSweep.y;
      }

      hi = clamp(hi * opening, 0.0, 1.0);
      vec3 hcol = vec3(0.965, 0.98, 1.0);
      gl_FragColor = vec4(hcol * hi, hi);
      return;
    }

    // ================= OJO =================
    vec3 S = texOpen(Pw);

    // iris con dilatación: remapeo radial que comprime/estira la textura
    float rp = uPupilR / uIrisR;
    float rp0 = uPupilTexR / uIrisTexR;
    float tr = r < rp ? (r / rp) * rp0 : rp0 + (r - rp) / (1.0 - rp) * (1.0 - rp0);
    tr = min(tr, 1.01);
    vec3 iris = texture2D(uIris, 0.5 + d2 * tr * uIrisTexR).rgb;
    // iris claro, hielo / gris azulado, luminoso
    iris = mix(iris, vec3(luma(iris)), 0.22);
    iris = pow(iris, vec3(0.84)) * vec3(1.03, 1.07, 1.09);

    // fibras finas extra cuando la cámara está muy cerca
    if (uDetail > 0.001) {
      vec3 np = vec3(d2 * 52.0, r * 7.0);
      float n = vnoise3(np) * 0.6 + vnoise3(np * vec3(2.03, 2.03, 1.7)) * 0.4;
      float fib = (n - 0.5) * uDetail * smoothstep(rp, rp + 0.06, r);
      iris *= 1.0 + 0.30 * fib * (0.6 + luma(iris));
    }

    // borde limbal más oscuro y suave
    iris *= mix(1.0, 0.82, smoothstep(0.86, 1.0, r));
    // la sombra del párpado (de la foto de la esclerótica) se transfiere al iris
    float shade = clamp(luma(S) / 0.905, 0.32, 1.0);
    iris *= mix(1.0, shade, 0.9);
    // pupila negra pura
    float pe = 0.006 + aaR;
    iris *= smoothstep(rp - pe, rp + pe * 1.4, r);

    // sombra del párpado superior sobre el iris (oclusión)
    float upE = up0 + lid;
    iris *= 1.0 - 0.55 * exp(-max(P.y - upE, 0.0) / 22.0);
    iris *= 1.0 - 0.28 * exp(-max(lo0 - P.y, 0.0) / 7.0);
    float aI = 1.0 - smoothstep(1.0 - 0.014 - aaR, 1.0 + 0.004 + aaR, r);
    // el iris está un poco hundido: sombra suave alrededor del limbo
    S *= 1.0 - 0.07 * exp(-pow((r - 1.02) * 16.0, 2.0)) * opening;

    vec3 col = mix(S, iris, aI * opening);

    // ---- parpadeo: cortinas que bajan/suben con la foto del ojo cerrado ----
    if (b > 0.0005) {
      float k = smoothstep(0.0, 0.16, b);
      float xIn2 = smoothstep(uCurveX.x - 50.0, uCurveX.x + 10.0, x) * (1.0 - smoothstep(uCurveX.y - 10.0, uCurveX.y + 50.0, x));
      vec3 lidCol = col;
      if (P.y < eU) {
        float ys = P.y + (cl - eU) * smoothstep(eU - 260.0, eU, P.y);
        lidCol = texClosed(vec2(x, ys));
      } else if (P.y > eL) {
        float ys = P.y - (eL - cl) * (1.0 - smoothstep(eL, eL + 170.0, P.y));
        lidCol = texClosed(vec2(x, ys));
      } else {
        // sombra del borde del párpado sobre el ojo
        float sh = exp(-(P.y - eU) / 9.0) * 0.45 + exp(-(eL - P.y) / 6.0) * 0.2;
        lidCol = col * (1.0 - sh * k);
      }
      vec3 fade = mix(col, texClosed(P), k);
      col = mix(col, mix(fade, lidCol, xIn2), k);
    }

    // ajuste de color: la piel termina exactamente en el color del fondo
    col = col * uGrade;

    // grano de película casi invisible
    col += (hash12(frag + fract(uTime * 7.3) * 113.0) - 0.5) * uGrain;

    // viñeta: la piel se funde con el fondo
    float alpha = 1.0;
    if (uVignette > 0.5) {
      float vd = length((P - uVigC) / uVigR);
      // fundido "high-key": la piel se aclara hacia el fondo y recién ahí se vuelve transparente
      col = mix(col, uBgCol, smoothstep(0.40, 0.86, vd));
      alpha = 1.0 - smoothstep(0.66, 0.98, vd);
      vec2 inImg = step(vec2(0.0), P) * step(P, uImg);
      alpha *= inImg.x * inImg.y;
    }
    gl_FragColor = vec4(clamp(col, 0.0, 1.0) * alpha, alpha);
  }
`;
