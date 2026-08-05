#!/bin/bash
cd docs
./make_diffs.sh
./adoc2md.sh -t
cd -
