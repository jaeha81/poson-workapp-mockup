# 실무자-가이드북.md 를 index.html 안(관리자 페이지 › 가이드북)에 심습니다.
# 가이드북을 고친 뒤 이 파일만 실행하면 앱 화면도 같이 바뀝니다.
#   python embed-guide.py
import io, re, sys, pathlib

here = pathlib.Path(__file__).parent
md   = (here / '실무자-가이드북.md').read_text(encoding='utf-8')
idx  = here / 'index.html'
html = idx.read_text(encoding='utf-8')

# </script> 가 본문에 있으면 스크립트 블록이 일찍 닫힙니다 — 미리 막습니다
md = md.replace('</script>', '<\\/script>')

pat = re.compile(r'(<script type="text/markdown" id="guideMd">\n).*?(\n</script>)', re.S)
if not pat.search(html):
    sys.exit('index.html 에서 guideMd 블록을 찾지 못했습니다')

html = pat.sub(lambda m: m.group(1) + md.rstrip('\n') + m.group(2), html, count=1)
idx.write_text(html, encoding='utf-8')
print(f'심었습니다 — {len(md.splitlines())}줄 → index.html')
