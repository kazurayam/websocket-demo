#!/bin/bash
cd docs
./make_diffs.sh
./adoc2md.sh -t
cd -
git add .
git commit -m "update docs/index_.adoc"
git push origin main
