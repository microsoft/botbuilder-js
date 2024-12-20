/**
 * Returns a stripped version of the Http Response which only contains body,
 * headers and the status.
 *
 * @param response - The Http Response
 * @returns The stripped version of Http Response.
 */
function stripResponse(response) {
    const strippedResponse = {};
    strippedResponse.body = response.bodyAsText;
    strippedResponse.headers = response.headers;
    strippedResponse.status = response.status;
    return strippedResponse;
  }
  
  /**
   * Returns a stripped version of the Http Request that does not contain the
   * Authorization header.
   *
   * @param request - The Http Request object
   * @returns The stripped version of Http Request.
   */
  function stripRequest(request) {
    const strippedRequest = request.clone();
    if (strippedRequest.headers) {
      strippedRequest.headers.remove("authorization");
    }
    return strippedRequest;
  }
  
  module.exports = { stripResponse, stripRequest };