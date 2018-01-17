var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus[ConnectionStatus["Uninitialized"] = 0] = "Uninitialized";
    ConnectionStatus[ConnectionStatus["Connecting"] = 1] = "Connecting";
    ConnectionStatus[ConnectionStatus["Online"] = 2] = "Online";
    ConnectionStatus[ConnectionStatus["ExpiredToken"] = 3] = "ExpiredToken";
    ConnectionStatus[ConnectionStatus["FailedToConnect"] = 4] = "FailedToConnect";
    ConnectionStatus[ConnectionStatus["Ended"] = 5] = "Ended"; // the bot ended the conversation
})(ConnectionStatus = {});

var guid = function () {
    var guid = 'xxxxxxxx-xxxx-8xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return guid;
};

define(["rx"], function (Rx) {
    return {
        WebChatConnector: (function () {
            function WebChatConnector() {
                this.connectionStatus$ = new Rx.BehaviorSubject(ConnectionStatus.Uninitialized);
                this.connectionStatus$.next(ConnectionStatus.Online);
                this.activity$ = this.postToWebChat().share();
            }
            WebChatConnector.prototype.end = function () {
                this.connectionStatus$.next(ConnectionStatus.Ended);
            };
            WebChatConnector.prototype.postActivity = function (activity) {
                activity.recipient = botId;
                activity.conversation = conversationId;
                activity.id = guid();
                var receive = Rx.Observable.fromPromise(this.onReceive(activity));
                return receive.map(function (v, idx) {
                    return activity.id;
                });
            };
            WebChatConnector.prototype.postToWebChat = function () {
                var _this = this;
                return Rx.Observable.create(function (s) {
                    _this.onActivityAvailable = function (a) {
                        s.next(a);
                    };
                    return function () {
                        _this.onActivityAvailable = undefined;
                    };
                });
            };
            WebChatConnector.prototype.post = function (activities) {
                var _this = this;
                activities.forEach(function (activity) {
                    activity.id = guid();
                    var date = new Date(); 
                    activity.timestamp = date.toISOString();
                    return _this.onActivityAvailable(activity);
                });
                return Promise.resolve({ handled: true });
            };
            return WebChatConnector;
        }())
    }
});