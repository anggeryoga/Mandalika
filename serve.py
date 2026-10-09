#!/usr/bin/env python3
"""
Server statis untuk situs UT SALUT Mandalika dengan dukungan clean URL
dan redirect 301 dari *.html -> tanpa ekstensi.

- /fakultas        -> layani fakultas.html
- /fakultas.html   -> redirect 301 ke /fakultas
- /                -> index.html
- Aset statis apa pun dilayani normal.
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ROOT = os.path.dirname(os.path.abspath(__file__))
PAGES = {"index", "fakultas", "gallery", "formulir", "daftar"}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def do_GET(self):
        path = urlsplit(self.path).path

        # 1) Redirect 301: /x.html -> /x  (kecuali index.html -> /)
        if path.endswith(".html"):
            base = path[1:-5]  # buang '/' dan '.html'
            if base == "index":
                target = "/"
            elif base in PAGES:
                target = "/" + base
            else:
                target = None
            if target is not None:
                q = urlsplit(self.path).query
                loc = target + (("?" + q) if q else "")
                self.send_response(301)
                self.send_header("Location", loc)
                self.end_headers()
                return

        # 2) Clean URL: /fakultas -> fakultas.html
        rel = path.lstrip("/")
        if rel == "" :
            rel = "index.html"
        if "." not in os.path.basename(rel):
            candidate = rel + ".html"
            if os.path.isfile(os.path.join(ROOT, candidate)):
                self.path = "/" + candidate
            elif os.path.isfile(os.path.join(ROOT, rel, "index.html")):
                self.path = "/" + rel + "/index.html"

        return super().do_GET()

    def end_headers(self):
        # Header keamanan + cache aset statis dasar
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def main():
    bind = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8080
    httpd = ThreadingHTTPServer((bind, port), Handler)
    print(f"Serving {ROOT} on http://{bind}:{port} (clean URL aktif)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
