#!/usr/bin/env python3
"""
Entry point for the AEGIS application.

- Runs a live Hamming Weight power simulation in the background
- Serves the frontend using Python's built-in HTTP server
- Stops cleanly when the user types 'exit'
"""

import http.server
import socketserver
import sys
import threading
import webbrowser
from pathlib import Path
import os
from threading import Event

# ---------------------------------------------------------------------
# Add project root to path so we can import hamming_power_sim
# ---------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# pylint: disable=wrong-import-position,import-error
from hamming_power_sim import run_continuous_simulation


# ---------------------------------------------------------------------
# Frontend Server
# ---------------------------------------------------------------------
def run_frontend_server(port: int = 8000) -> None:
    """
    Start a simple HTTP server to serve frontend files.

    Args:
        port: Preferred port to start the server on
    """
    frontend_path = PROJECT_ROOT / "frontend"
    os.chdir(frontend_path)

    handler = http.server.SimpleHTTPRequestHandler

    for attempt_port in [port, port + 1, port + 2, 9000, 9001]:
        try:
            with socketserver.TCPServer(("", attempt_port), handler) as httpd:
                print(f"\n[OK] Frontend running at http://localhost:{attempt_port}")
                webbrowser.open(f"http://localhost:{attempt_port}")
                httpd.serve_forever()
                break
        except OSError:
            continue
    else:
        print("[ERROR] Could not start frontend server (ports busy)")


# ---------------------------------------------------------------------
# Main Application
# ---------------------------------------------------------------------
def main() -> None:
    """Main entry point for AEGIS."""

    print("=" * 60)
    print("AEGIS – Live Side-Channel Power Simulation")
    print("=" * 60)

    # Event used to stop the live simulation
    stop_event = Event()

    # -----------------------------------------------------------------
    # Start Live Simulation Thread
    # -----------------------------------------------------------------
    sim_thread = threading.Thread(
        target=run_continuous_simulation,
        args=(stop_event,),
        daemon=True
    )
    sim_thread.start()
    print("[OK] Live power simulation started")

    # -----------------------------------------------------------------
    # Start Frontend Server Thread
    # -----------------------------------------------------------------
    server_thread = threading.Thread(
        target=run_frontend_server,
        kwargs={"port": 8000},
        daemon=True
    )
    server_thread.start()
    print("[OK] Frontend server started")

    # -----------------------------------------------------------------
    # Keep Application Running
    # -----------------------------------------------------------------
    print("\n[INFO] Type 'exit' and press Enter to stop the application\n")

    try:
        while True:
            user_input = input().strip().lower()
            if user_input == "exit":
                print("\nStopping simulation and server...")
                stop_event.set()
                break
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received. Shutting down...")
        stop_event.set()

    print("[OK] AEGIS shut down cleanly.")


# ---------------------------------------------------------------------
if __name__ == "__main__":
    main()
