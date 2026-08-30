"""Torna o fundo bege/cinza-claro da logo By Karolinny transparente.

Estrategia: amostra a cor dos 4 cantos (que sao fundo puro), calcula uma
distancia RGB e transforma em transparente tudo dentro de um threshold.
Alpha suave nas bordas para nao deixar serrilhado.
"""
from PIL import Image
import sys

SRC = "public/karolinny/logo.jpeg"
DST = "public/karolinny/logo.png"
THRESHOLD_HARD = 22    # dentro disso vira 100% transparente
THRESHOLD_SOFT = 60    # entre hard e soft cai gradualmente (anti-serrilhado)

img = Image.open(SRC).convert("RGBA")
w, h = img.size
px = img.load()

# Media dos 4 cantos = cor do fundo
def sample(x, y):
    r, g, b, _ = px[x, y]
    return r, g, b

samples = [sample(0, 0), sample(w-1, 0), sample(0, h-1), sample(w-1, h-1)]
bg_r = sum(s[0] for s in samples) // 4
bg_g = sum(s[1] for s in samples) // 4
bg_b = sum(s[2] for s in samples) // 4
print(f"Fundo detectado: ({bg_r}, {bg_g}, {bg_b})")

fully_transparent = 0
soft = 0
for y in range(h):
    for x in range(w):
        r, g, b, _ = px[x, y]
        d = max(abs(r-bg_r), abs(g-bg_g), abs(b-bg_b))
        if d <= THRESHOLD_HARD:
            px[x, y] = (r, g, b, 0)
            fully_transparent += 1
        elif d < THRESHOLD_SOFT:
            # Alpha proporcional entre hard e soft
            alpha = int(255 * (d - THRESHOLD_HARD) / (THRESHOLD_SOFT - THRESHOLD_HARD))
            px[x, y] = (r, g, b, alpha)
            soft += 1

img.save(DST, "PNG", optimize=True)
print(f"OK  hard={fully_transparent}  soft={soft}  total_px={w*h}")
print(f"Salvo em {DST}")
