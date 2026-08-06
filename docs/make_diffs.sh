#!/bin/bash
diff ../src/vanilla-javascript/index.html ../src/htmx-ws/index.html > ./diffs/index.html.diff
diff ../src/vanilla-javascript/index.ts ../src/htmx-ws/index.ts > ./diffs/index.ts.diff
diff ../src/vanilla-javascript/broadcast.ts ../src/htmx-ws/broadcast.ts > ./diffs/broadcast.ts.diff
