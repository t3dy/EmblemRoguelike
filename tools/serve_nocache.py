"""Tiny static server for the game that disables caching (so edits show on reload).
Serves the game/ directory on port 7431."""
import http.server, socketserver, os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # -> game/
PORT = 7431

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('', PORT), NoCache) as httpd:
    print(f'serving game/ with no-cache on :{PORT}')
    httpd.serve_forever()
