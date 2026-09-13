"""Validate YAML, provenance and declared requirement-to-test mappings."""

import hashlib
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]


class UniqueLoader(yaml.SafeLoader):
    pass


def unique_mapping(loader, node, deep=False):
    result = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if key in result:
            raise ValueError(f"Duplicate YAML key: {key}")
        result[key] = loader.construct_object(value_node, deep=deep)
    return result


UniqueLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, unique_mapping
)


def read(path):
    return yaml.load(path.read_text(encoding="utf-8"), Loader=UniqueLoader)


def main():
    spec_path = ROOT / "docs/specs/sdd_testes_cicd.yaml"
    scope = read(ROOT / "docs/specs/release_scope.yaml")
    spec = read(spec_path)
    for path in (ROOT / "docs").rglob("*.yaml"):
        read(path)
    for path in (ROOT / ".github/workflows").glob("*.yml"):
        read(path)
    read(ROOT / "compose.yaml")
    origin = ROOT / "docs" / spec["documento"]["origem"]["arquivo"]
    assert origin.exists(), "SDD origin does not exist"
    assert (
        hashlib.sha256(origin.read_bytes()).hexdigest()
        == spec["documento"]["origem"]["sha256"]
    ), "SDD origin hash mismatch"
    assert (
        ROOT / "docs/portifolio_daniel.yaml"
    ).read_bytes() == spec_path.read_bytes(), "Legacy SDD copy diverged"
    source_ids = set(
        re.findall(
            r'id: "(RF-\d+|RNF-\d+|RN-\d+|CA-\d+)"', origin.read_text(encoding="utf-8")
        )
    )
    scenarios = {}
    for section, values in spec.items():
        if not section.startswith("cenarios_"):
            continue
        for item in values:
            case = item["id"]
            assert case not in scenarios, f"Duplicate scenario {case}"
            scenarios[case] = item
            assert set(item.get("requisitos", [])) <= source_ids, (
                f"Unknown requirement in {case}"
            )
    active = scope["active_ids"]
    assert len(active) == len(set(active)), "Duplicate active ID"
    assert set(active) <= source_ids, "Unknown active requirement"
    covered = set()
    for case, paths in scope["test_paths"].items():
        assert case in scenarios, f"Unknown scenario {case}"
        assert paths, f"No test for {case}"
        for name in paths:
            path = ROOT / name
            assert path.exists(), f"Missing test {name}"
            content = path.read_text(encoding="utf-8").replace("TC_", "TC-")
            assert case in content, f"{case} absent from {name}"
        covered.update(scenarios[case].get("requisitos", []))
    assert set(active) <= covered, (
        f"Active requirements without mapped tests: {set(active) - covered}"
    )
    assert set(scope["completed_phases"]) <= set(range(1, 7)), "Invalid phase"
    if scope["completed_phases"]:
        assert scope.get("acceptance_evidence"), (
            "Completed phases require acceptance evidence"
        )
    print(
        f"Validated YAML, provenance, {len(active)} active IDs and {len(scope['test_paths'])} mapped scenarios."
    )


if __name__ == "__main__":
    try:
        main()
    except (AssertionError, ValueError, KeyError, OSError, yaml.YAMLError) as exc:
        print(f"Specification validation failed: {exc}", file=sys.stderr)
        sys.exit(1)
