from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = 8780
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)
    with ThreadingHTTPServer(('0.0.0.0', port), NoCacheHandler) as httpd:
        print(f'Threaded dev server running at http://127.0.0.1:{port}')
        httpd.serve_forever()
