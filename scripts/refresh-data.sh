#!/usr/bin/env bash
#
# Pulls the live views into public/*.ndjson for local dev, which has no Quick
# SDK. The deployed app queries them directly and doesn't need these files.
#
#   ./scripts/refresh-data.sh
#   VITE_USE_PROD_DATA=true npm run dev
#
# Output is workgroup:mozilla-confidential. Gitignored — do not commit.

set -euo pipefail

cd "$(dirname "$0")/.."

WORKGROUPS_VIEW='mozdata.mozcloud.workgroups'
MEMBERS_VIEW='mozdata.mozcloud.workgroup_subgroup_members'

dump() {
  local view="$1" order="$2" out="$3"
  echo "==> ${view} -> ${out}"
  bq query \
    --use_legacy_sql=false \
    --format=json \
    --max_rows=1000000 \
    "SELECT TO_JSON_STRING(t) AS row_json FROM \`${view}\` t ORDER BY ${order}" \
    | python3 -c '
import json, sys
rows = json.load(sys.stdin)
for r in rows:
    # row_json is already a JSON document; emit it verbatim as one NDJSON line.
    sys.stdout.write(r["row_json"] + "\n")
print(f"    {len(rows)} rows", file=sys.stderr)
' > "$out"
}

dump "$WORKGROUPS_VIEW" 't.workgroup' public/workgroups.ndjson
dump "$MEMBERS_VIEW" 't.workgroup, t.subgroup, t.member_type, t.value' public/subgroup_members.ndjson

echo "==> done"
