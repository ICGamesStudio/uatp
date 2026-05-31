from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[4]
SCHEMA_PATH = ROOT / "schema" / "uatp.schema.json"
SCHEMA = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
VALIDATOR = Draft202012Validator(SCHEMA)


def parse_uatp(source: str, filename: str | None = None) -> dict[str, Any]:
    if filename and filename.endswith(".json"):
        value = json.loads(source)
    else:
        value = yaml.safe_load(source)
    if not isinstance(value, dict):
        raise ValueError("UATP document must be an object")
    return value


def load_uatp(filename: str | Path) -> dict[str, Any]:
    path = Path(filename)
    return parse_uatp(path.read_text(encoding="utf-8"), str(path))


def validate_uatp(document: dict[str, Any]) -> tuple[bool, list[dict[str, str]]]:
    errors = sorted(VALIDATOR.iter_errors(document), key=lambda error: list(error.path))
    return len(errors) == 0, [
        {
            "path": "/" + "/".join(str(part) for part in error.path),
            "message": error.message,
            "keyword": error.validator,
        }
        for error in errors
    ]


def assert_valid_uatp(document: dict[str, Any]) -> dict[str, Any]:
    valid, errors = validate_uatp(document)
    if not valid:
        raise ValueError("\n".join(f"{error['path']}: {error['message']}" for error in errors))
    return document


def transpile_uatp(document: dict[str, Any], target: str = "openai") -> str:
    assert_valid_uatp(document)
    if target == "openai":
        return to_openai_prompt(document)
    if target == "claude":
        return to_claude_prompt(document)
    raise ValueError(f"Unsupported transpiler target: {target}")


def to_openai_prompt(document: dict[str, Any]) -> str:
    return "\n".join(
        [
            "You are executing a Universal Agent Task Protocol (UATP) task.",
            "",
            _render_task(document),
            "",
            "Follow the constraints exactly. Return only the requested output format.",
        ]
    )


def to_claude_prompt(document: dict[str, Any]) -> str:
    return "\n".join(
        [
            "Execute this UATP task carefully and explain only what the output contract asks for.",
            "",
            _render_task(document),
            "",
            "Respect action order, scope boundaries, and risk constraints.",
        ]
    )


def _render_task(document: dict[str, Any]) -> str:
    return yaml.safe_dump(document, sort_keys=False).strip()
