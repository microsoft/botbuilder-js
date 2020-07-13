Set-Location -Path "$(System.DefaultWorkingDirectory)/samples/javascript_nodejs/02.echo-bot"

New-Item -Path . -Name ".npmrc" -ItemType "file" -Value "registry=https://botbuilder.myget.org/F/botbuilder-v4-js-daily/npm/"
