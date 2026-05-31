from __future__ import annotations

import argparse
import json

from .core import load_uatp, transpile_uatp, validate_uatp


def main() -> int:
    parser = argparse.ArgumentParser(prog="uatp")
    parser.add_argument("command", choices=["validate", "transpile"])
    parser.add_argument("filename")
    parser.add_argument("legacy_target", nargs="?", choices=["openai", "claude"])
    parser.add_argument("--target", default=None, choices=["openai", "claude"])
    args = parser.parse_args()
    target = args.target or args.legacy_target or "openai"

    document = load_uatp(args.filename)

    if args.command == "validate":
        valid, errors = validate_uatp(document)
        if not valid:
            print(json.dumps(errors, indent=2))
            return 1
        print("valid")
        return 0

    print(transpile_uatp(document, target))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
