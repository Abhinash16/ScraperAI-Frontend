import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out+'/brand', exist_ok=True)
L = Image.LANCZOS

def clean(im):
    # near-opaque interiors (~252) -> fully opaque; drop faint stray specks
    r,g,b,a = im.split()
    a = a.point(lambda v: 0 if v < 8 else min(255, round((v-8)*255/(244-8))))
    return Image.merge('RGBA',(r,g,b,a))

def trim(im): return im.crop(im.getchannel('A').point(lambda v:255 if v>8 else 0).getbbox())

def pad_square(im, size, fill_ratio, bg=None):
    c = Image.new('RGBA',(size,size), bg or (0,0,0,0))
    s = fill_ratio*size/max(im.size)
    m = im.resize((max(1,round(im.width*s)), max(1,round(im.height*s))), L)
    c.alpha_composite(m, ((size-m.width)//2, (size-m.height)//2))
    return c

icon = trim(clean(Image.open(src+'/icon.png').convert('RGBA')))
word = trim(clean(Image.open(src+'/wordmark.png').convert('RGBA')))

# ---- mark (transparent) ----
for n in (1024,512,256,192,128,64):
    pad_square(icon, n, 1.0).save(f'{out}/brand/mark-{n}.png', optimize=True)

# ---- wordmark: light-bg (original) + dark-bg (dark text -> white) ----
def fit_h(im,h): return im.resize((round(im.width*h/im.height),h), L)
for h in (96,192,384):
    fit_h(word,h).save(f'{out}/brand/wordmark-{h}.png', optimize=True)
# dark variant: dark navy pixels (the "scraper" letters, visor) become white, but
# only in the text region (x beyond the mark) so the robot visor stays navy
markw = int(word.width*0.255)
px = word.load(); dark = word.copy(); dp = dark.load()
for y in range(word.height):
    for x in range(markw, word.width):
        r,g,b,a = px[x,y]
        if a and max(r,g,b) < 90 and b-r < 60:
            dp[x,y] = (255,255,255,a)
for h in (96,192,384):
    fit_h(dark,h).save(f'{out}/brand/wordmark-dark-{h}.png', optimize=True)

# ---- favicons / app icons ----
WHITE=(255,255,255,255)
pad_square(icon,16,1.0).save(out+'/favicon-16x16.png', optimize=True)
pad_square(icon,32,1.0).save(out+'/favicon-32x32.png', optimize=True)
pad_square(icon,256,1.0).save(out+'/favicon.ico', sizes=[(16,16),(32,32),(48,48),(64,64)])
pad_square(icon,180,0.80,WHITE).convert('RGB').save(out+'/apple-touch-icon.png', optimize=True)
for n in (192,512):
    pad_square(icon,n,0.86).save(f'{out}/android-chrome-{n}x{n}.png', optimize=True)
    pad_square(icon,n,0.66,WHITE).convert('RGB').save(f'{out}/maskable-{n}x{n}.png', optimize=True)
pad_square(icon,512,1.0).save(out+'/logo.png', optimize=True)
pad_square(icon,192,1.0).save(out+'/logo-192.png', optimize=True)

# ---- social preview 1200x630 ----
og = Image.new('RGBA',(1200,630),WHITE)
d = ImageDraw.Draw(og)
# soft brand glow
glow = Image.new('RGBA',(1200,630),(0,0,0,0)); gd=ImageDraw.Draw(glow)
gd.ellipse((-200,-300,700,400),fill=(14,165,250,40)); gd.ellipse((600,300,1500,1000),fill=(124,58,237,40))
og.alpha_composite(glow.filter(ImageFilter.GaussianBlur(120)))
wm = fit_h(word,190)
if wm.width>1000: wm = wm.resize((1000,round(wm.height*1000/wm.width)),L)
og.alpha_composite(wm,((1200-wm.width)//2,190))
font=None
for f in ['/System/Library/Fonts/Supplemental/Arial.ttf','/System/Library/Fonts/Helvetica.ttc']:
    try: font=ImageFont.truetype(f,38); break
    except Exception: pass
t='AI customer support for WhatsApp and your website'
tw=d.textlength(t,font=font); d.text(((1200-tw)/2,430),t,fill=(71,85,105),font=font)
og.convert('RGB').save(out+'/og-image.png', optimize=True)
print('ok', icon.size, word.size)
