call npm run doc
call npm run build
robocopy ".\dist" "." /E /is

pause