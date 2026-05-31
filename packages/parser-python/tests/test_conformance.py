from pathlib import Path
import subprocess
import sys

import pytest

from uatp import load_uatp, transpile_uatp, validate_uatp

ROOT = Path(__file__).resolve().parents[3]
VALID_DIR = ROOT / "tests" / "fixtures" / "valid"
INVALID_DIR = ROOT / "tests" / "fixtures" / "invalid"


@pytest.mark.parametrize("fixture", sorted(VALID_DIR.glob("*.yaml")))
def test_valid_fixtures_pass(fixture: Path) -> None:
    valid, errors = validate_uatp(load_uatp(fixture))
    assert valid, errors


@pytest.mark.parametrize("fixture", sorted(INVALID_DIR.glob("*.yaml")))
def test_invalid_fixtures_fail(fixture: Path) -> None:
    valid, _ = validate_uatp(load_uatp(fixture))
    assert not valid


def test_transpilers_include_contract() -> None:
    document = load_uatp(VALID_DIR / "debug_code.yaml")

    assert "Universal Agent Task Protocol" in transpile_uatp(document, "openai")
    assert "success_criteria" in transpile_uatp(document, "claude")


def test_cli_accepts_target_flag() -> None:
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "uatp.cli",
            "transpile",
            str(VALID_DIR / "debug_code.yaml"),
            "--target",
            "claude",
        ],
        check=True,
        text=True,
        capture_output=True,
    )
    assert "success_criteria" in result.stdout
