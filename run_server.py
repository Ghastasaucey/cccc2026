from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import webbrowser


ROOT = Path(__file__).resolve().parent
PORT = 8000


def main():
    os.chdir(ROOT)
    url = f"http://127.0.0.1:{PORT}/index.html"
    print(f"Serving at {url}")
    webbrowser.open(url)
    ThreadingHTTPServer(("127.0.0.1", PORT), SimpleHTTPRequestHandler).serve_forever()


if __name__ == "__main__":
    main()
