const Responses = {
  baseResponse(statusCode = 502, data = {}) {
    return {
      headers: {
        "Content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
      },
      statusCode,
      body: JSON.stringify(data),
    };
  },

  200(data = {}) {
    return this.baseResponse(200, data);
  },

  400(data = {}) {
    return this.baseResponse(400, data);
  },

  404(data = {}) {
    return this.baseResponse(404, data);
  },
};

module.exports = Responses;
