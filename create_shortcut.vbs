Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "C:\Users\Sharesth\Desktop\AutoHunter AI.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "C:\Users\Sharesth\.gemini\antigravity\scratch\autohunter_ai\run.bat"
oLink.WorkingDirectory = "C:\Users\Sharesth\.gemini\antigravity\scratch\autohunter_ai"
oLink.Description = "AutoHunter AI - Global Freelance & Automation Hunter"
oLink.IconLocation = "%SystemRoot%\System32\shell32.dll,14"
oLink.Save
WScript.Echo "Shortcut updated successfully"
