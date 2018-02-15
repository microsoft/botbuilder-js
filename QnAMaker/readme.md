# Project

QnAMaker is command line tool for interacting with QnAMaker service

* this should be node based
* It should be delivered via npm
* it should have consistent switches with other tooling
* it should have usage 
* it should have appropriate copyright notice

## example Usage

QnAMaker 1.0.0
(c) Microsoft All Rights Reserved.
ERROR(S):
No verb selected.

create      CreateKB using urls or QnAMakerPairs
delete      Delete a KB
download    Download KB QnAMakerPairs as tab delimited pairs
ask         ask a question
update      update knowledgebase
help        Display more information on a specific command.
version     Display version information.

# verbs 

## create verb

USAGE:
To Create KB using QnaPairs from file (either in JSON or TSV form):
	QnA create --file [qnapairs.tsv|qnapairs.json] --name [name] --subscriptionkey [subscriptionKey]
To Create KB using urls from file:
	QnA create --file [urls.txt] --name [name] --subscriptionkey [subscriptionKey]
  -n, --name               Required. Name of the knowledge base
  -f, --file               The path to a file containing urls or QnA Pairs as JSON, (if you omit the file parameter then console input will be assumed)
  -s, --subscriptionkey    Required. The subscription key
  --help                   Display this help screen.
  --version                Display version information.
  
## delete verb

USAGE:
to delete kb
	QnAMaker delete --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey]
  -k, --kbid               Required. The knowledge base to create knowledge in
  -s, --subscriptionkey    Required. The subscription key
  --help                   Display this help screen.
  --version                Display version information.

## download verb

USAGE:
To Download KB to output:
	QnAMaker download --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey]
To Download KB to tsv file:
	QnAMaker download -f kb.tsv --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey]
  -f                       Download KB to tsv (tab delimited) file
  -k, --kbid               Required. The knowledge base to create knowledge in
  -s, --subscriptionkey    Required. The subscription key
  -q, --questions     -> export questions only
  -a, --answers       -> export answers only
  --help                   Display this help screen.
  --version                Display version information.

## ask verb
USAGE:
Ask a question of a KB :
	QnAMaker ask --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey] "\"why is the sky blue\""
Get more then 1 answer from a KB :
	QnAMaker ask --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey] --top 5 "\"why is the sky blue\""
  -t, --top                (Default: 1) How many answers do you want?
  -k, --kbid               Required. The knowledge base to create knowledge in
  -s, --subscriptionkey    Required. The subscription key
  --help                   Display this help screen.
  --version                Display version information.
  [question] (pos. 0)      Question to ask

## update verb
USAGE:
To Add QnaPairs from file:
	QnAMaker update -a Add -f qnapairs.json --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey]
To Add QnaPairs from stdin:
	QnAMaker update -a Add --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey]
To Add urls from file:
	QnAMaker update -a Add -f urls.txt --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey]
To Add urls from stdin:
	QnAMaker update -a Add --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey]
To Delete QnaPairs from file:
	QnAMaker update -a Delete -f qnapairs.json --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey]
To Delete QnaPairs from stdin:
	QnAMaker update -a Delete --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey]
To Delete urls from file:
	QnAMaker update -a Delete -f urls.txt --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey]
To Delete urls from stdin:
	QnAMaker update -a Delete --kbid [knowledgebaseId] --subscriptionkey [subscriptionKey]

  -f                       The path to a file containing urls or QnA Pairs as JSON, (if missing, then console input will be assumed)
  -a                       The action to perform [Add|Delete] If not specified then Add
  -k, --kbid               Required. The knowledge base to create knowledge in
  -s, --subscriptionkey    Required. The subscription key
  --help                   Display this help screen.
  --version                Display version information.

