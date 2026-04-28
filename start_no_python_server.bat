@echo off
cd /d %~dp0
powershell -ExecutionPolicy Bypass -File ".\scripts\start_server.ps1"
