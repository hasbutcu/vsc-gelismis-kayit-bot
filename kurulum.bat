@echo off
title vsc-kayit Botu Kurulum
color 9
echo.
echo config.json Dosyasini Doldurmayi Unutmayin!
echo Doldurdugunuzu Onaylamak icin Bir Tusa Basin...
pause >nul

node deploy-commands.js

npm install

close