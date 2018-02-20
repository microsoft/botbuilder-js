# Chatdown

Chatdown is a transcript generator which consumes a markdown file to generate activity transcripts

## arguments

| args                                      | result                                                       |
| :---------------------------------------- | ------------------------------------------------------------ |
| --in=input.chatmd --out=output.transcript | input.chatmd will be read, output.transcript will be output  |
| --out=output.transcript                   | stdin will be read, output.transcript will be output         |
| --in=input.chatmd                         | input.chatmd will be read, stout will be output              |
| --in=input --out=output                   | input.chatmd will be read (assume ext is .chatmd) output.transcript will be written (assume .transcript ext) |
| no args                                   | stdin will be read, stdout will be output                    |

#### example

Chatmd [my.chat][my.transcript]



