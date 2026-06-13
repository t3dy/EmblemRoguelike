"""
build_fugues.py — convert the 50 Atalanta Fugiens fugues into game note-data.

Source: RIFF-wrapped MIDI sequencings of Maier's public-domain 1617 fugues
(downloaded to game/_curation/midi/). Each fugue is a three-voice canon:
  Atalanta (vox fugiens) · Hippomenes (vox sequens) · Pomum objectum (vox morans).

We extract each voice as a monophonic [midi, beats] sequence (rests = midi 0),
in quarter-note beats, and write game/assets/fugues.json for the music engine.
The authoritative MEI for Fugue 1 (Brown Univ. Furnace & Fugue) is parsed too as
a cross-check / preferred source for emblem 1.
"""
import os, io, json, glob
import mido

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
MIDI_DIR = os.path.join('game', '_curation', 'midi')
OUT = os.path.join('game', 'assets', 'fugues.json')

def load_riff_midi(path):
    data = open(path, 'rb').read()
    i = data.find(b'MThd')
    if i < 0:
        raise ValueError('no MThd in ' + path)
    return mido.MidiFile(file=io.BytesIO(data[i:]))

def quantize(beats, grid=0.25):
    q = round(beats / grid) * grid
    return round(q, 3)

def extract_notes(mf):
    """Return (bpm, total_beats, notes) with notes=[[start_beat, dur_beat, midi]]
    for every note in the piece (all 3 voices preserved as written)."""
    tpb = mf.ticks_per_beat
    tempo = 500000
    on = {}            # (track,chan,pitch) -> start_tick
    notes = []
    for ti, tr in enumerate(mf.tracks):
        t = 0
        for m in tr:
            t += m.time
            if m.type == 'set_tempo':
                tempo = m.tempo
            elif m.type == 'note_on' and m.velocity > 0:
                on[(ti, m.channel, m.note)] = t
            elif m.type == 'note_off' or (m.type == 'note_on' and m.velocity == 0):
                k = (ti, m.channel, m.note)
                if k in on:
                    st = on.pop(k)
                    notes.append([quantize(st / tpb), max(0.25, quantize((t - st) / tpb)), m.note])
    notes.sort(key=lambda n: (n[0], n[2]))
    total = max((s + d for s, d, _ in notes), default=0)
    bpm = round(60_000_000 / tempo, 1)
    return bpm, round(total, 2), notes

def main():
    out = {}
    files = sorted(glob.glob(os.path.join(MIDI_DIR, 'emblem_*.mid')))
    for f in files:
        n = int(os.path.basename(f).split('_')[1].split('.')[0])
        try:
            mf = load_riff_midi(f)
            bpm, total, notes = extract_notes(mf)
            if not notes:
                print('skip (no notes)', n); continue
            out[str(n)] = {'bpm': bpm, 'beats': total, 'notes': notes}
            print(f'emblem {n:2d}: bpm {bpm:5} notes {len(notes):3d} total {total:.1f} beats')
        except Exception as e:
            print('FAIL', n, e)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, 'w'), separators=(',', ':'))
    print('\nwrote', OUT, '-', len(out), 'fugues,', os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    main()
