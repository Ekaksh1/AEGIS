#!/usr/bin/env python3
"""
Entry point for the AEGIS application.

- Runs a live Hamming Weight power simulation in the background
- Serves the frontend using Python's built-in HTTP server
- Stops cleanly when the user types 'exit'
"""


def main() -> None:
    """Main entry point for AEGIS."""

    print("=" * 60)
    print("AEGIS – Live Side-Channel Power Simulation")
    print("=" * 60)


    print("[OK] AEGIS shut down cleanly.")

if __name__ == "__main__":
    main()