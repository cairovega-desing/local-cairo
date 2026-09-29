#!/usr/bin/env python3
"""Genera los sonidos del juego (WAV 44.1 kHz) en la carpeta sounds/.
Súbelos a Roblox (create.roblox.com → Audio) y pega los IDs en Config.Sonidos.

Uso:  pip install numpy && python3 tools/make_sounds.py
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sounds")
rng = np.random.default_rng(7)


def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def env(length, attack, tau):
    x = t(length)
    a = np.clip(x / max(attack, 1e-5), 0, 1)
    return a * np.exp(-x / tau)


def sweep(f0, f1, length, curve=1.0):
    """Seno cuyo tono va de f0 a f1 (curva exponencial)."""
    x = t(length) / length
    freq = f0 * (f1 / f0) ** (x**curve)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR)


def bell(freq, length, tau=0.25, bright=0.35):
    """Nota tipo marimba/campanita: fundamental + parciales que se apagan rápido."""
    x = t(length)
    tone = np.sin(2 * np.pi * freq * x)
    tone += bright * np.sin(2 * np.pi * freq * 4.0 * x) * np.exp(-x / (tau * 0.15))
    tone += 0.25 * np.sin(2 * np.pi * freq * 2.0 * x) * np.exp(-x / (tau * 0.5))
    return tone * env(length, 0.002, tau)


def noise(length):
    return rng.uniform(-1, 1, int(SR * length))


def highpass(x, amount=0.97):
    y = np.zeros_like(x)
    prev_x = prev_y = 0.0
    for i, v in enumerate(x):
        prev_y = amount * (prev_y + v - prev_x)
        prev_x = v
        y[i] = prev_y
    return y


def lowpass(x, amount=0.1):
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += amount * (v - acc)
        y[i] = acc
    return y


def mix(length, *parts):
    out = np.zeros(int(SR * length))
    for offset, sig in parts:
        start = int(SR * offset)
        end = min(len(out), start + len(sig))
        out[start:end] += sig[: end - start]
    return out


def save(name, signal, drive=1.4):
    signal = np.tanh(signal * drive)  # saturación suave: más «gordo», sin picos
    fade = min(len(signal), int(SR * 0.01))
    signal[-fade:] *= np.linspace(1, 0, fade)
    signal = signal / (np.max(np.abs(signal)) + 1e-9) * 0.92
    data = (signal * 32767).astype(np.int16)
    path = os.path.join(OUT, name + ".wav")
    with wave.open(path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(data.tobytes())
    print("  ", os.path.relpath(path))


def note(semitones_from_c5):
    return 523.25 * 2 ** (semitones_from_c5 / 12)


def main():
    os.makedirs(OUT, exist_ok=True)
    print("Generando sonidos:")

    # POP: chasquido brillante + golpe grave de goma + brillo agudo + aire
    L = 0.32
    snap = highpass(noise(L), 0.9) * env(L, 0.0004, 0.010)
    thump = sweep(460, 120, L, 0.5) * env(L, 0.001, 0.035) * 0.9
    shine = np.sin(2 * np.pi * 2300 * t(L)) * env(L, 0.0005, 0.012) * 0.18
    air = lowpass(noise(L), 0.15) * env(L, 0.002, 0.07) * 0.35
    save("pop", snap + thump + shine + air, drive=1.8)

    # NOTA: marimba en Do5 (el juego la sube por una escala pentatónica)
    save("nota", bell(note(0), 0.7, tau=0.22), drive=1.1)

    # DORADO: arpegio rápido de campanitas + brillo
    L = 0.9
    arp = [(i * 0.055, bell(note(12 + s), 0.6, tau=0.25)) for i, s in enumerate([0, 4, 7, 12, 16])]
    sparkle = highpass(noise(L), 0.98) * env(L, 0.01, 0.25) * 0.08
    save("dorado", mix(L, *arp, (0, sparkle)))

    # COMBO: acorde brillante que sube un poquito de tono
    L = 0.7
    chord = sum(sweep(note(s), note(s) * 1.06, L) for s in [0, 4, 7, 12]) * env(L, 0.005, 0.25)
    save("combo", chord + highpass(noise(L), 0.98) * env(L, 0.002, 0.1) * 0.1)

    # CUENTA y ¡YA!
    L = 0.18
    beep = (np.sin(2 * np.pi * 660 * t(L)) + 0.25 * np.sin(2 * np.pi * 1980 * t(L))) * env(L, 0.003, 0.08)
    save("cuenta", beep, drive=1.2)
    L = 0.5
    go = mix(L, (0, bell(988, 0.5, tau=0.2, bright=0.5)), (0.06, bell(1318, 0.44, tau=0.25, bright=0.5)))
    save("ya", go)

    # PUERTA: «fiuuu» + arpegio triunfal
    L = 1.0
    whoosh = highpass(noise(L), 0.8) * np.sin(np.pi * np.clip(t(L) / 0.45, 0, 1)) * 0.25
    fanfare = [(0.05 + i * 0.08, bell(note(s), 0.7, tau=0.3)) for i, s in enumerate([0, 4, 7, 12])]
    save("puerta", mix(L, (0, whoosh), *fanfare))

    # PODER: barrido hacia arriba con vibrato
    L = 0.8
    x = t(L)
    freq = 220 * (8 ** (x / L)) * (1 + 0.03 * np.sin(2 * np.pi * 18 * x))
    power = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    power += 0.3 * np.sign(power) * 0.5
    save("poder", power * env(L, 0.01, 0.6) + highpass(noise(L), 0.98) * env(L, 0.2, 0.3) * 0.08)

    # DISPARO: «fiu» corto
    L = 0.1
    save("disparo", sweep(2200, 500, L) * env(L, 0.001, 0.03) + highpass(noise(L), 0.9) * env(L, 0.0005, 0.01) * 0.4)

    # VICTORIA: fanfarria
    L = 1.6
    brass = lambda f, length: sum(np.sin(2 * np.pi * f * k * t(length)) / k for k in (1, 3, 5)) * env(length, 0.01, 0.5)
    parts = [(0.0, brass(note(0), 0.2)), (0.16, brass(note(4), 0.2)), (0.32, brass(note(7), 0.2)), (0.48, brass(note(12), 1.1))]
    parts += [(0.48, bell(note(s), 1.1, tau=0.5) * 0.5) for s in (0, 4, 7)]
    save("victoria", mix(L, *parts))

    # REBOTE: «boing»
    L = 0.35
    x = t(L)
    freq = 180 + 520 * (x / L) ** 0.6 + 30 * np.sin(2 * np.pi * 25 * x)
    save("rebote", np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(L, 0.003, 0.15))

    # GIGANTE: golpe grave de goma
    L = 0.4
    save("gigante", sweep(150, 45, L, 0.6) * env(L, 0.001, 0.12) + sweep(420, 260, L) * env(L, 0.001, 0.05) * 0.4
         + lowpass(noise(L), 0.1) * env(L, 0.001, 0.05) * 0.5, drive=2.0)

    # DESBLOQUEO: cascada de campanitas hacia arriba
    L = 1.2
    cascade = [(i * 0.045, bell(note(s), 0.7, tau=0.3)) for i, s in enumerate([0, 2, 4, 7, 9, 12, 14, 16, 19, 24])]
    save("desbloqueo", mix(L, *cascade, (0, highpass(noise(L), 0.99) * env(L, 0.05, 0.4) * 0.06)))


if __name__ == "__main__":
    main()
