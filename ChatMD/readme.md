# Chatmd

ChatMD is a transcript generator which consumes a markdown file to generate activity transcripts

## arguments

chatmd input.chatmd output.transcript

| args                           | result                                                       |
| :----------------------------- | ------------------------------------------------------------ |
| input.chatmd output.transcript | input.chatmd will be read, output.transcript will be output  |
| output.transcript              | stdin will be read, output.transcript will be output         |
| input output                   | input.chatmd will be read (assume ext is .chatmd) output.transcript will be written (assume .transcript ext) |
| no args                        | stdin will be read, stdout will be output                    |

#### example

Chatmd [my.chat][my.transcript]



