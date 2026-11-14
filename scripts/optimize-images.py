"""Create web copies; keep every original image alongside its optimized copy."""
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent/'docs'
assets=json.loads((root/'preload-manifest.json').read_text(encoding='utf-8'))['assets']
replacements={}
before=after=0
for asset in assets:
    source=root/asset['url'].removeprefix('./')
    if source.suffix!='.png' or source.stat().st_size<100_000: continue
    target=source.with_suffix('.webp')
    with Image.open(source) as image:
        image.thumbnail((1920,1920),Image.Resampling.LANCZOS)
        image.save(target,'WEBP',quality=90,method=6)
    before+=source.stat().st_size
    after+=target.stat().st_size
    replacements[source.relative_to(root).as_posix()]=target.relative_to(root).as_posix()
for file in [*root.glob('*.js'),*root.glob('*.css'),root/'index.html']:
    with file.open(encoding='utf-8',newline='') as handle: text=handle.read()
    original=text
    for old,new in replacements.items(): text=text.replace(old,new)
    if file.name=='identity-card.js': text=text.replace("+'.png'", "+'.webp'")
    if text!=original:
        with file.open('w',encoding='utf-8',newline='') as handle: handle.write(text)
print(json.dumps({'images':len(replacements),'beforeMiB':round(before/1048576,2),'afterMiB':round(after/1048576,2)}))
