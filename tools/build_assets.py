"""
build_assets.py — Emblem Knight asset pipeline.

Turns the 20 curated emblem extractions / hand-crops into game-ready sprites:
  - optional manual crop box (for creatures that live inside a full plate)
  - background removal (bright paper -> transparent) for woodcut/plate sources
  - alpha-crop to content bbox
  - pad to square, resize to target with nearest-neighbor (NES-ish crispness)
  - light posterize so the woodcut reads as a retro sprite

Outputs:
  game/assets/sprites/<name>.png        (display sprites, transparent)
  game/assets/sprites/_SHEET.png        (review contact sheet)
  game/assets/manifest.json             (consumed by the game at runtime)
"""
import os, sys, json
from PIL import Image, ImageOps, ImageFilter
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import validate_assets

# Game repo root (contains assets/, js/, index.html)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Sibling repos that hold source imagery
PRINTSHOP = os.path.join(ROOT, '..', 'EmblemPrintShop')
CLAUDIENS  = os.path.join(ROOT, '..', 'Claudiens')

os.chdir(ROOT)
OUT = os.path.join('assets', 'sprites')
os.makedirs(OUT, exist_ok=True)

def ps(path):
    """Resolve a path relative to EmblemPrintShop."""
    return os.path.normpath(os.path.join(PRINTSHOP, path))

def cl(path):
    """Resolve a path relative to the Claudiens repo."""
    return os.path.normpath(os.path.join(CLAUDIENS, path))

# role: where the sprite is used. kind: hero|npc|monster|structure|terrain|decor
# crop: (x0,y0,x1,y1) in source px, or None for whole image
# bg: 'paper' removes bright background; 'alpha' trusts existing alpha; 'keep' no removal
# size: longest-edge target px
def _e(plate, tag):
    """Path to an extracted individual from EmblemPrintShop."""
    return ps(f'assets/extracted_all/{plate}/individual/{tag}_transparent.png')

def _af(emblem):
    """Path to an Atalanta Fugiens plate from Claudiens."""
    return cl(f'site/images/emblems/emblem-{emblem:02d}.jpg')

MANIFEST = [
 # --- HERO + NPCs (woodcut single figures) ---
 dict(name='hero',    kind='hero',   label='The Knight',
      src=_e('stolcius_plate_013', 'person'),
      bg='paper', size=96),
 dict(name='king',    kind='npc',    label='King of the Sun-Castle',
      src=_e('stolcius_plate_033', 'man_old_man'),
      bg='paper', size=96),
 dict(name='sage',    kind='npc',    label='The Sage',
      src=_e('stolcius_plate_047', 'man_old_man'),
      bg='paper', size=96),
 dict(name='villager',kind='npc',    label='Villager',
      src=_e('stolcius_plate_023', 'man_old_man'),
      bg='paper', size=96),

 # --- MONSTERS ---
 dict(name='m_dragon', kind='monster', label='The Alchemical Dragon',
      src=_af(25), crop=(470, 600, 1010, 1290), bg='paper', size=480),
 dict(name='m_wlion',  kind='monster', label='Hound of the Furnace',
      src=_e('stolcius_plate_006', 'dog'),
      bg='paper', size=260),
 dict(name='m_bear',   kind='monster', label='Forest Bear',
      src=_e('emblem-24', 'bear_ox_frog'),
      bg='paper', size=260),
 dict(name='m_wolf',   kind='monster', label='Grey Wolf',
      src=_e('stolcius_plate_078', 'wolf_frog'),
      bg='paper', size=240),
 dict(name='m_salamander', kind='monster', label='Red Fox Familiar',
      src=_e('splendor_solis_local_p0008', 'wolf_frog_fox'),
      bg='alpha', size=340),
 dict(name='m_harpy',  kind='monster', label='Harpy',
      src=_e('splendor_solis_ia_p0054', 'eagle_bird_butterfly'),
      bg='alpha', size=340),
 dict(name='m_toad',   kind='monster', label='Venom Toad',
      src=_e('stolcius_plate_017', 'frog'),
      bg='paper', size=200),
 dict(name='m_serpent',kind='monster', label='River Serpent',
      src=_e('stolcius_plate_054', 'eagle_serpent'),
      bg='paper', size=220),
 # --- dragons (hand-cropped from Atalanta Fugiens plates) ---
 dict(name='m_ouroboros', kind='monster', label='Ouroboros Wyrm',
      src=_af(14), crop=(150, 520, 1230, 1230), bg='paper', size=480),
 dict(name='m_wyrm', kind='monster', label='Coiling Wyrm',
      src=_af(50), crop=(470, 420, 1090, 1200), bg='paper', size=450),
 # --- alchemical beasts ---
 dict(name='m_lion', kind='monster', label='The Alchemical Hound',
      src=_e('stolcius_plate_013', 'dog'),
      bg='paper', size=240),
 dict(name='m_stag', kind='monster', label='White Stag',
      src=_e('splendor_solis_ia_p0019', 'deer'),
      bg='alpha', size=340),
 dict(name='m_boar', kind='monster', label='Wild Boar',
      src=_af(41), crop=(1085, 465, 1490, 690), bg='paper', size=320),
 dict(name='m_swan', kind='monster', label='Black Swan',
      src=_e('mclean_second_p0042', 'bird'),
      bg='alpha', size=200),
 dict(name='m_tortoise', kind='monster', label='Stone Tortoise',
      src=_e('stolcius_plate_001', 'tortoise'),
      bg='paper', size=260),
 dict(name='m_horse', kind='monster', label='Night-Mare',
      src=_e('splendor_solis_local_p0022', 'horse'),
      bg='alpha', size=280),
 dict(name='m_peacock', kind='monster', label='Cauda Pavonis',
      src=_e('khunrath_p0197', 'peacock'),
      bg='paper', size=300),
 dict(name='m_dove', kind='monster', label='White Dove',
      src=_e('splendor_solis_ia_p0048', 'bird_dove'),
      bg='alpha', size=260),
 dict(name='m_eagle', kind='monster', label='Eagle',
      src=_e('stolcius_plate_032', 'eagle_peacock'),
      bg='paper', size=260),
 dict(name='m_fish', kind='monster', label='River Fish',
      src=_e('emblem-22', 'fish'),
      bg='paper', size=260),

 # --- STRUCTURES (overworld landmarks) ---
 dict(name='s_castle', kind='structure', label='Sun-Castle',
      src=_e('stolcius_plate_002', 'castle'),
      bg='paper', size=160),
 dict(name='s_tower',  kind='structure', label='Watchtower',
      src=_e('cramer_page_0077', 'tower'),
      bg='paper', size=140),
 dict(name='s_town',   kind='structure', label='Village',
      src=_e('emblem-28', 'tower_chimney'),
      bg='paper', size=150),
 dict(name='s_gate',   kind='structure', label='Stone Bridge',
      src=_e('mclean_second_p0050', 'gate_bridge'),
      bg='paper', size=150),
 dict(name='s_door',   kind='structure', label='Dungeon Door',
      src=_e('emblem-08', 'door'),
      bg='paper', size=120),

 # --- TERRAIN DECOR ---
 dict(name='t_forest', kind='terrain', label='Forest',
      src=_e('stolcius_plate_031', 'forest'),
      bg='paper', size=110),
 dict(name='t_mountain',kind='terrain', label='Mountain',
      src=_e('stolcius_plate_005', 'mountain_hill'),
      bg='paper', size=120),
 dict(name='t_mountain2',kind='terrain', label='Peaks',
      src=_e('emblem-46', 'mountain_hill'),
      bg='paper', size=130),
 dict(name='t_cave',   kind='terrain', label='Cave',
      src=_e('mclean_second_p0056', 'cave'),
      bg='paper', size=120),
 dict(name='t_cliff',  kind='terrain', label='Cliff',
      src=_e('maier_arcana_p0180', 'cliff'),
      bg='paper', size=120),
 dict(name='t_forest2',kind='terrain', label='Woods',
      src=_e('stolcius_plate_061', 'forest'),
      bg='paper', size=110),

 # --- DECOR (title screen) ---
 dict(name='d_sun',   kind='decor', label='Sol',
      src=_e('emblem-45', 'sun'),
      bg='paper', size=200),

 # --- PLAYER CLASSES (character select) ---
 dict(name='c_alchemist', kind='hero', label='The Alchemist',
      src=_af(21), crop=(32, 150, 544, 1421), bg='paper', size=200),
 dict(name='c_atalanta',  kind='hero', label='Atalanta',
      src=_e('stolcius_plate_002', 'woman'),
      bg='paper', size=110),
 dict(name='c_hippomenes',kind='hero', label='Hippomenes',
      src=_e('splendor_solis_ia_p0038', 'person'),
      bg='alpha', size=110),

 # --- QUEST GIVERS (Sol & Luna) ---
 dict(name='q_king',  kind='npc', label='The King (Sol)',
      src=_e('stolcius_plate_033', 'man_old_man'),
      bg='paper', size=130),
 dict(name='q_queen', kind='npc', label='The Queen (Luna)',
      src=_e('stolcius_plate_044', 'woman_queen'),
      bg='paper', size=130),
]


def remove_paper(im, thresh=205):
    """Make bright (paper) pixels transparent; keep ink + mid-tones."""
    rgba = np.array(im.convert('RGBA'))
    rgb = rgba[:, :, :3].astype(np.int32)
    lum = (0.299*rgb[:, :, 0] + 0.587*rgb[:, :, 1] + 0.114*rgb[:, :, 2])
    # saturation: colored regions (colored woodcuts) should be kept even if bright
    mx = rgb.max(axis=2); mn = rgb.min(axis=2)
    sat = (mx - mn)
    paper = (lum > thresh) & (sat < 28)
    rgba[:, :, 3] = np.where(paper, 0, rgba[:, :, 3])
    # soft fe: fade near-paper to reduce halo
    near = (lum > thresh-25) & (lum <= thresh) & (sat < 28)
    a = rgba[:, :, 3].astype(np.float32)
    a[near] = a[near] * 0.55
    rgba[:, :, 3] = a.astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')


def alpha_bbox_crop(im, pad=6):
    a = np.array(im)[:, :, 3]
    ys, xs = np.where(a > 24)
    if len(xs) == 0:
        return im
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    x0 = max(0, x0-pad); y0 = max(0, y0-pad)
    x1 = min(im.width-1, x1+pad); y1 = min(im.height-1, y1+pad)
    return im.crop((int(x0), int(y0), int(x1)+1, int(y1)+1))


def posterize_rgb(im, bits=4):
    r, g, b, a = im.split()
    rgb = Image.merge('RGB', (r, g, b))
    rgb = ImageOps.posterize(rgb, bits)
    r, g, b = rgb.split()
    return Image.merge('RGBA', (r, g, b, a))


def process(entry):
    im = Image.open(entry['src']).convert('RGBA')
    if entry.get('crop'):
        im = im.crop(entry['crop'])
    bg = entry.get('bg', 'alpha')
    if bg == 'paper':
        im = remove_paper(im)
    elif bg == 'alpha':
        # also strip any stray bright halo around the existing alpha subject
        im = remove_paper(im, thresh=235)
    im = alpha_bbox_crop(im)
    # resize longest edge to target
    size = entry['size']
    scale = size / max(im.width, im.height)
    nw, nh = max(1, round(im.width*scale)), max(1, round(im.height*scale))
    im = im.resize((nw, nh), Image.LANCZOS)
    im = posterize_rgb(im, bits=6)
    out_path = os.path.join(OUT, entry['name'] + '.png')
    im.save(out_path)
    return im, out_path


def main():
    processed = []
    manifest_out = []
    missing = []
    for e in MANIFEST:
        if not os.path.exists(e['src']):
            print('MISSING', e['name'], e['src'])
            missing.append(e)
            continue
        im, path = process(e)
        processed.append((e, im))
        rec = {k: e[k] for k in ('name', 'kind', 'label')}
        rec['file'] = 'assets/sprites/' + e['name'] + '.png'
        rec['w'], rec['h'] = im.width, im.height
        rec['src'] = e['src'].replace('\\', '/')
        manifest_out.append(rec)
        print(f"ok {e['name']:12s} {im.width}x{im.height}")

    with open(os.path.join('assets', 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest_out, f, indent=2)

    # review sheet on a dark battle-like bg
    cell, cols = 220, 5
    rows = (len(processed)+cols-1)//cols
    sheet = Image.new('RGBA', (cols*cell, rows*cell), (24, 22, 34, 255))
    from PIL import ImageDraw
    dr = ImageDraw.Draw(sheet)
    for i, (e, im) in enumerate(processed):
        thumb = im.copy(); thumb.thumbnail((cell-20, cell-34))
        cx, cy = (i % cols)*cell, (i//cols)*cell
        sheet.alpha_composite(thumb, (cx + (cell-thumb.width)//2, cy + 8))
        dr.text((cx+6, cy+cell-22), f"{e['name']} [{e['kind']}]", fill=(255, 230, 150, 255))
    sheet.convert('RGB').save(os.path.join('assets', 'sprites', '_SHEET.png'))
    print('\nwrote', len(manifest_out), 'sprites + manifest + _SHEET.png')

    # --- post-build verification -------------------------------------------
    # Fail loud rather than silently shipping a game with a missing sprite.
    print()
    hard, warn, info, stats = validate_assets.validate()
    validate_assets.report(hard, warn, info, stats)

    if missing:
        print("\nBUILD FAILED: %d source image(s) could not be found:" % len(missing))
        for e in missing:
            print("   - %s  <-  %s" % (e['name'], e['src']))
        print("Restore the source(s) or fix the path in MANIFEST, then re-run.")
        sys.exit(2)
    if hard:
        print("\nBUILD FAILED: manifest validation reported errors (see HARD above).")
        sys.exit(1)


if __name__ == '__main__':
    main()
