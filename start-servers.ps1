wt -w 0 new-tab powershell -NoExit -Command "cd `"$PSScriptRoot\client`"; npm run dev" `
; split-pane -H -p "Windows PowerShell" -NoExit -Command "cd `"$PSScriptRoot\server`"; npm run dev"
