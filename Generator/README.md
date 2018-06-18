# generator-botbuilder

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> Yeoman generator for Microsoft Bot Framework

## Features

Scaffolds a bot using [Microsoft Bot Framework](https://dev.botframework.com), and provides a set of dialogs to jump start bot development.

### Dependencies

- [dotenv](https://github.com/motdotla/dotenv) for managing environmental variables
- [restify](http://restify.com/) for hosting the API

## Installation

First, install [Yeoman](http://yeoman.io) and generator-botbuilder using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

Since we are developing the generator locally, it’s not yet available as a global npm module. A global module may be created and symlinked to a local one, using npm. 
In order to do that, we need to navigate to the generator-botbuilder folder and type:

```bash
npm link
```

That will install the project dependencies and symlink a global module to your local file. After npm is done, we need to type:

```bash
yo botbuilder
```

This will start a set of prompts that will guide the bot creation. The bot will be created inside generator-botbuilder and we can just run it using node.

### Next Steps

- Update `.env` with your keys as needed
- Add your logic

## Getting To Know Bot Framework

- [Bot Framework](https://dev.botframework.com/)
- [Bot Framework Documentation](https://docs.botframework.com/)
- [Microsoft Virtual Academy](http://aka.ms/botcourse)

## Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

## License

MIT © Microsoft

[npm-image]: https://badge.fury.io/js/generator-botbuilder.svg
[npm-url]: https://npmjs.org/package/generator-botbuilder
[travis-image]: https://travis-ci.org/geektrainer/generator-botbuilder.svg?branch=master
[travis-url]: https://travis-ci.org/geektrainer/generator-botbuilder
[daviddm-image]: https://david-dm.org/geektrainer/generator-botbuilder.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/geektrainer/generator-botbuilder