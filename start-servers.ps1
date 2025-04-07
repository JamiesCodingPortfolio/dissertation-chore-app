# Open the client server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$PSScriptRoot\client`"; npm run dev"

# Open the server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$PSScriptRoot\server`"; npm run dev"

# Optional: Keep the current window open for debugging (if running interactively)
Read-Host -Prompt "Press Enter to exit"
