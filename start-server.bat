@echo off
cd /d "%~dp0"
echo Starting People's Priority demo server...
echo Open in browser: http://localhost:5500
echo Press Ctrl+C to stop.
python -m http.server 5500
