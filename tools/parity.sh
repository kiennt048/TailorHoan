#!/usr/bin/env bash
# Compare structural parity between index.html (vi) and en.html (en).
# Text differs by design; STRUCTURE must not.
cd /home/user/TailorHoan || exit 1
fail=0

extract() {
  # class attribute values + section ids + tag skeleton
  grep -o 'class="[^"]*"' "$1" | sed 's/class="//;s/"//' | tr ' ' '\n' | grep -v '^$' | sort | uniq -c | awk '{print $2" "$1}' | sort
}

diff <(extract index.html) <(extract en.html) > /tmp/parity_class.diff 2>&1 \
  && echo "OK  class inventory identical" \
  || { echo "DIFF class inventory:"; cat /tmp/parity_class.diff; fail=1; }

ids_vi=$(grep -o 'id="[^"]*"' index.html | sort)
ids_en=$(grep -o 'id="[^"]*"' en.html | sort)
diff <(echo "$ids_vi") <(echo "$ids_en") > /tmp/parity_id.diff 2>&1 \
  && echo "OK  id inventory identical" \
  || { echo "DIFF id inventory:"; cat /tmp/parity_id.diff; fail=1; }

for f in index.html en.html; do
  for tag in section div article; do
    o=$(grep -o "<$tag[ >]" "$f" | wc -l); c=$(grep -o "</$tag>" "$f" | wc -l)
    [ "$o" = "$c" ] || { echo "UNBALANCED $f <$tag>: $o open / $c close"; fail=1; }
  done
done
[ $fail -eq 0 ] && echo "PARITY PASS" || echo "PARITY FAIL"
exit $fail
