#!/bin/bash
diff ../packages/vanilla-javascript/index.html ../packages/htmx-ws/index.html > ./diffs/index.html.diff
diff ../packages/vanilla-javascript/index.ts ../packages/htmx-ws/index.ts > ./diffs/index.ts.diff
diff ../packages/vanilla-javascript/broadcast.ts ../packages/htmx-ws/broadcast.ts > ./diffs/broadcast.ts.diff
