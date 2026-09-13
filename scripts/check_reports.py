"""Fail CI for absent, empty, failed or skipped mandatory JUnit suites."""

import sys
import xml.etree.ElementTree as ET
from pathlib import Path

for name in sys.argv[1:]:
    path = Path(name)
    root = ET.parse(path).getroot()
    cases = list(root.iter("testcase"))
    if not cases or any(
        case.find(kind) is not None
        for case in cases
        for kind in ["failure", "error", "skipped"]
    ):
        raise SystemExit(f"Mandatory report failed or has no tests: {path}")
    print(f"{path}: {len(cases)} passed, no skipped tests")
if len(sys.argv) < 2:
    raise SystemExit("At least one report is required")
