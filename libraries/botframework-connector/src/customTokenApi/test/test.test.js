var request = require("request");

var base_url = "http://localhost:3000/"

describe("== Initializing tests ==", function() {
  describe("TEST 1 /", function() {
    it("Status OK", function() {
      request.get(base_url, function(error, response, body) {
      });
    });
  });
});