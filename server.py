#!/usr/bin/env python3
"""
3839 Review Fetcher - Local Server
启动后浏览器打开 http://localhost:8888 即可使用。
手机/平板在同一 WiFi 下访问 http://[电脑IP]:8888 也可使用。

用法: python server.py
"""

import http.server
import urllib.request
import urllib.parse
import os
import sys

PORT = 8888
API_TARGET = "https://www.3839.com/app/hykb_web/api/api_user.php"
HTML_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "index.html")


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        """Serve the HTML page."""
        if self.path == "/" or self.path == "/index.html":
            try:
                with open(HTML_FILE, "r", encoding="utf-8") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(content.encode("utf-8"))
            except FileNotFoundError:
                self.send_error(404, "index.html not found")
        else:
            self.send_error(404)

    def do_POST(self):
        """Proxy API requests to 3839.com."""
        if self.path != "/api":
            self.send_error(404)
            return

        # Read request body
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")

        # Forward to 3839 API
        req = urllib.request.Request(
            API_TARGET,
            data=body.encode("utf-8"),
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Origin": "https://www.3839.com",
                "Referer": "https://www.3839.com/zone/user/",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                api_data = resp.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(api_data)
        except urllib.error.URLError as e:
            self.send_response(502)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(f'{{"code":"error","msg":"{str(e)}"}}'.encode("utf-8"))

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        # Simplified logging
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]}\n")


def main():
    # Get local IP for mobile access
    import socket
    local_ip = socket.gethostbyname(socket.gethostname())

    print(f"\n{'='*50}")
    print(f"  3839 Review Fetcher - 服务已启动")
    print(f"{'='*50}")
    print(f"\n  📱 本机访问:  http://localhost:{PORT}")
    print(f"  📲 手机访问:  http://{local_ip}:{PORT}")
    print(f"\n  按 Ctrl+C 停止服务\n")
    print(f"{'='*50}\n")

    server = http.server.HTTPServer(("0.0.0.0", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务已停止")
        server.server_close()


if __name__ == "__main__":
    main()
