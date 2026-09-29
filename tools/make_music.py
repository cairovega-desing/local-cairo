#!/usr/bin/env python3
"""Genera la música de fondo (loops perfectos) en sounds/:
  musica_carrera.wav  chiptune alegre y rápida (140 BPM)
  musica_lobby.wav    versión tranquila (100 BPM)
El juego acelera la de carrera en la última etapa (Config.Musica).

Uso:  pip install numpy && python3 tools/make_music.py
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sounds")
rng = np.random.default_rng(3)

# Progresión feliz: Do - Sol - Lam - Fa (I–V–vi–IV)
CHORDS = [
    [60, 64, 67, 72],  # Do
    [55, 59, 62, 67],  # Sol
    [57, 60, 64, 69],  # Lam
    [53, 57, 60, 65],  # Fa
]
# Melodía (semitonos MIDI) por compás, en corcheas; None = silencio
HOOK = [
    [76, None, 79, 76, 74, None, 72, 74],
    [74, None, 71, 74, 79, None, 74, None],
    [72, None, 76, 72, 81, 79, 76, None],
    [77, None, 76, 74, 72, None, 74, None],
]


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def env(n, attack, decay_tau, release=0.01):
    x = np.arange(n) / SR
    e = np.clip(x / max(attack, 1e-5), 0, 1) * np.exp(-x / decay_tau)
    r = int(SR * release)
    if r and n > r:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def pulse(freq, n, duty=0.25):
    phase = (np.arange(n) * freq / SR) % 1.0
    return np.where(phase < duty, 1.0, -1.0)


def tri(freq, n):
    phase = (np.arange(n) * freq / SR) % 1.0
    return 4 * np.abs(phase - 0.5) - 1


def smooth(x, k=6):
    """Suaviza un poco (quita el «chirrido» de las ondas cuadradas)."""
    kernel = np.ones(k) / k
    return np.convolve(x, kernel, mode="same")


class Track:
    def __init__(self, seconds):
        self.buf = np.zeros(int(SR * seconds))

    def add(self, start_s, sig, gain):
        start = int(SR * start_s)
        idx = (np.arange(len(sig)) + start) % len(self.buf)  # lo que sobra vuelve al inicio: loop perfecto
        np.add.at(self.buf, idx, sig * gain)


def kick(n):
    x = np.arange(n) / SR
    freq = 50 + 110 * np.exp(-x / 0.03)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-x / 0.12)


def snare(n):
    x = np.arange(n) / SR
    noise = rng.uniform(-1, 1, n)
    return (noise * 0.8 + np.sin(2 * np.pi * 190 * x) * 0.4) * np.exp(-x / 0.06)


def hat(n):
    noise = rng.uniform(-1, 1, n)
    noise = noise - np.convolve(noise, np.ones(4) / 4, mode="same")  # solo agudos
    return noise * np.exp(-np.arange(n) / SR / 0.018)


def render(bpm, bars, energetic):
    beat = 60 / bpm
    eighth = beat / 2
    bar_len = beat * 4
    track = Track(bar_len * bars)

    for b in range(bars):
        chord = CHORDS[b % 4]
        t0 = b * bar_len

        # Bajo: corcheas saltando entre raíz y octava
        root = chord[0] - 24
        for k in range(8):
            note = root + (12 if k % 2 else 0)
            n = int(SR * eighth * 0.9)
            sig = smooth(pulse(midi(note), n, 0.5), 10) * env(n, 0.003, 0.18)
            track.add(t0 + k * eighth, sig, 0.30 if energetic else 0.22)

        # Colchón suave del acorde (triangular)
        n = int(SR * bar_len)
        pad = sum(tri(midi(note), n) for note in chord[:3]) / 3
        track.add(t0, pad * env(n, 0.08, 2.5, 0.2), 0.10)

        if energetic:
            # Arpegio rápido en semicorcheas (primera mitad) + melodía (segunda mitad)
            if b < bars // 2:
                pattern = [0, 1, 2, 3, 2, 1, 2, 3] * 2
                for k, idx in enumerate(pattern):
                    n = int(SR * eighth / 2 * 0.85)
                    sig = smooth(pulse(midi(chord[idx] + 12), n, 0.25), 4) * env(n, 0.002, 0.08)
                    track.add(t0 + k * eighth / 2, sig, 0.12)
            else:
                for k, note in enumerate(HOOK[b % 4]):
                    if note is None:
                        continue
                    n = int(SR * eighth * 0.95)
                    sig = smooth(pulse(midi(note), n, 0.25), 4) * env(n, 0.004, 0.25)
                    track.add(t0 + k * eighth, sig, 0.16)
            # Batería
            for k in range(4):
                track.add(t0 + k * beat, kick(int(SR * 0.25)), 0.85 if k % 2 == 0 else 0.6)
                if k % 2 == 1:
                    track.add(t0 + k * beat, snare(int(SR * 0.2)), 0.35)
            for k in range(8):
                track.add(t0 + k * eighth, hat(int(SR * 0.05)), 0.12 if k % 2 else 0.07)
        else:
            # Lobby: marimba tranquila con la melodía y un «tic» suave
            for k, note in enumerate(HOOK[b % 4]):
                if note is None:
                    continue
                n = int(SR * 0.6)
                x = np.arange(n) / SR
                bell = np.sin(2 * np.pi * midi(note) * x) + 0.3 * np.sin(2 * np.pi * midi(note) * 4 * x) * np.exp(-x / 0.03)
                track.add(t0 + k * eighth, bell * env(n, 0.002, 0.22), 0.16)
            for k in range(4):
                track.add(t0 + k * beat, kick(int(SR * 0.2)), 0.35 if k == 0 else 0.2)
                track.add(t0 + k * beat + eighth, hat(int(SR * 0.04)), 0.05)

    out = np.tanh(track.buf * 1.3)
    return out / (np.max(np.abs(out)) + 1e-9) * 0.85


def save(name, signal):
    path = os.path.join(OUT, name + ".wav")
    with wave.open(path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((signal * 32767).astype(np.int16).tobytes())
    print("  ", os.path.relpath(path), f"({len(signal) / SR:.1f} s)")


def main():
    os.makedirs(OUT, exist_ok=True)
    print("Generando música:")
    save("musica_carrera", render(bpm=140, bars=16, energetic=True))
    save("musica_lobby", render(bpm=100, bars=8, energetic=False))


if __name__ == "__main__":
    main()
