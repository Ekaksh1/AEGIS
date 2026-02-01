import http.server
import socketserver
import webbrowser
import os
import sys
from threading import Timer

# Configuration
PORT = 8000
DIRECTORY = "."  # Serve files from the current directory

def open_browser():
    """Opens the default web browser to the local server."""
    url = f"http://localhost:{PORT}/index.html"
    print(f"[INFO] Opening browser at {url}")
    webbrowser.open_new(url)

def run_server():
    """Starts the HTTP server."""
    # Ensure we are serving the correct directory
    try:
        os.chdir(DIRECTORY)
    except FileNotFoundError:
        print(f"[ERROR] Could not find directory: {DIRECTORY}")
        sys.exit(1)
    
    handler = http.server.SimpleHTTPRequestHandler
    
    # Allow address reuse to prevent "Address already in use" errors on quick restarts
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print("-" * 40)
            print(f"⚡ AEGIS Power Analysis Platform")
            print("-" * 40)
            print(f"[INFO] Server started at http://localhost:{PORT}")
            print("[INFO] Press Ctrl+C to stop the server")
            
            # Open browser after a slight delay to ensure server is up
            Timer(1.5, open_browser).start()
            
            httpd.serve_forever()
            
    except OSError as e:
        print(f"\n[ERROR] Could not start server on port {PORT}.")
        print(f"Reason: {e}")
        print("Tip: Check if another application is using this port.")
    except KeyboardInterrupt:
        print("\n[INFO] Server stopped by user.")
        sys.exit(0)

if __name__ == "__main__":
    run_server()