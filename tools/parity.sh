#!/usr/bin/env bash
# Two guards, run before every commit:
#  1. index.html (vi) and en.html (en) stay structurally identical — text differs
#     by design, STRUCTURE must not.
#  2. Contact facts hardcoded in the JSON-LD match js/site-config.js. The JSON-LD
#     must be static for crawlers, so it is a second copy of those values and can
#     silently drift from the config the page actually renders from.
cd "$(dirname "$0")/.." || exit 1
fail=0

extract() {
  grep -o 'class="[^"]*"' "$1" | sed 's/class="//;s/"//' | tr ' ' '\n' | grep -v '^$' \
    | sort | uniq -c | awk '{print $2" "$1}' | sort
}

diff <(extract index.html) <(extract en.html) > /tmp/parity_class.diff 2>&1 \
  && echo "OK  class inventory identical" \
  || { echo "DIFF class inventory:"; cat /tmp/parity_class.diff; fail=1; }

diff <(grep -o 'id="[^"]*"' index.html | sort) <(grep -o 'id="[^"]*"' en.html | sort) \
     > /tmp/parity_id.diff 2>&1 \
  && echo "OK  id inventory identical" \
  || { echo "DIFF id inventory:"; cat /tmp/parity_id.diff; fail=1; }

for f in index.html en.html; do
  for tag in section div article table; do
    o=$(grep -o "<$tag[ >]" "$f" | wc -l); c=$(grep -o "</$tag>" "$f" | wc -l)
    [ "$o" = "$c" ] || { echo "UNBALANCED $f <$tag>: $o open / $c close"; fail=1; }
  done
done

if ! python3 - <<'PY'
import json, re, sys
cfg_src = open('js/site-config.js', encoding='utf-8').read()
def cfg(key):
    m = re.search(r'^\s*%s:\s*"([^"]*)"' % re.escape(key), cfg_src, re.M)
    return m.group(1) if m else ''
phone_digits = re.sub(r'\D', '', cfg('phone'))
expect_tel   = '+84' + phone_digits[1:] if phone_digits.startswith('0') else '+84' + phone_digits
expect_mail  = cfg('email')
expect_zalo  = 'https://zalo.me/' + cfg('zalo') if cfg('zalo') else None

bad = False
for f in ('index.html', 'en.html'):
    html = open(f, encoding='utf-8').read()
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        d = json.loads(block)
        for label, got, want in (('telephone', d.get('telephone'), expect_tel or None),
                                 ('email',     d.get('email'),     expect_mail or None)):
            if want and got != want:
                print('DRIFT %s %s: JSON-LD %r != site-config %r' % (f, label, got, want)); bad = True
        if expect_zalo and expect_zalo not in (d.get('sameAs') or []):
            print('DRIFT %s sameAs missing %s' % (f, expect_zalo)); bad = True
if bad:
    sys.exit(1)
print('OK  JSON-LD contact matches site-config.js')
PY
then fail=1; fi

[ $fail -eq 0 ] && echo "PARITY PASS" || echo "PARITY FAIL"
exit $fail
