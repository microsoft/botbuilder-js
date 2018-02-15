# Bot Command Line tool

This tool is used to manipulate a .bot file

## Verbs

### update

Download a bot file from ABS

example:

bot update --id xyz -f xyz.bot

Default is to download to [id].bot

If [id].bot already exists, it should merge with the existing file.

## register

register a bot with ABS

NOTE: This may simply be az command line, not certain if we need this



### services

#### add 

​	bot services add XXXX

Should add a reference to a XXXX application to the services section of the .bot file

#### remove

​	bot services remove XXXX

should remove a reference to XXXX from the services section of the .bot file

#### list

​	bot services list 

should list services that are registered

### register

bot register xyz.bot 

bot register xyz



### delete

bot delete --id botId | [file.bot]

should delete the ABS service registration, only after confirmation

