"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RiveScript = require("rivescript");
/**
 * Bot Builder Rivescript Receiver
 */
class RiveScriptReceiver {
    /**
     * creates a rivescript middleware host for the rivescript files/folders
     * @param pathOrPaths path or paths to files/folders for .rive files
     * @param options standard rivescript options
     */
    constructor(pathOrPaths, options) {
        this.engine = CreateRivescript(pathOrPaths, options);
    }
    /**
     * Handler for receive activity pipeline
     * @param context Bot context
     */
    receiveActivity(context, next) {
        return this.engine
            .then((engine) => {
            // load state
            if (context.request && context.request.text && context.request.from && context.request.from.id) {
                if (context.state && context.state.user && context.state.user.rivescript)
                    engine.setUservars(context.request.from.id, context.state.user.rivescript);
                let reply = engine.reply(context.request.from.id, context.request.text);
                if (context.request && context.request.from && context.request.from.id && context.state.user)
                    context.state.user.rivescript = engine.getUservars(context.request.from.id);
                if (reply != null && (reply != "ERR: No Reply Matched")) {
                    context.responses.push({ text: reply });
                }
            }
            return next();
        });
    }
}
exports.RiveScriptReceiver = RiveScriptReceiver;
/**
 * Helper class to instantiate a RiveScript engine as a promise making it easy to be consumed by bot builder
 * @param pathOrPaths path to  rivescript file, or array of paths to files
 * @param options standard rivescript option object
 */
function CreateRivescript(pathOrPaths, options) {
    return new Promise((resolve, reject) => {
        let rsEngine = new RiveScript(options || {});
        let paths = [];
        if (Array.isArray(pathOrPaths))
            paths = pathOrPaths;
        else
            paths.push(pathOrPaths);
        let count = paths.length;
        for (let iPath in paths) {
            let path = paths[iPath];
            rsEngine.loadFile(path, (batchCount) => {
                if (--count == 0) {
                    rsEngine.sortReplies();
                    resolve(rsEngine);
                }
            }, (err, batchCount) => {
                console.log("Error loading batch #" + batchCount + ": " + err + "\n");
                if (--count == 0) {
                    rsEngine.sortReplies();
                    resolve(rsEngine);
                }
            });
        }
    });
}
exports.CreateRivescript = CreateRivescript;
//# sourceMappingURL=rivescript.js.map