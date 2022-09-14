const Responses = require("../common/responses");
const Dynamo = require("../common/dynamo");

exports.createOrder = async (event) => {
  const request = JSON.parse(event.body);
  let response = Responses[400]({ message: "Failed to create order" });

  await Dynamo.write(request, "orders-table")
    .then((res) => {
      response = Responses[200]({ message: "Created the order", res });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Failed to create order",
        err: err.toString(),
      });
    });
  return response;
};

exports.getOrder = async (event) => {
  const request = event.pathParameters;
  let response = Responses[400]({ message: "Failed to fetch order" });

  await Dynamo.get(request.id, "orders-table")
    .then((data) => {
      response = Responses[200]({ message: "Fetched the order", data });
    })
    .catch((err) => {
      response = Responses[400]({ message: "Failed to fetch order", err });
    });
  return response;
};

exports.updateOrder = async (event) => {
  console.log("Event: ", event.body);

  return Responses[200]({ message: "Updated the order" });
};

exports.getAllOrders = async (event) => {
  const request = event.pathParameters;
  let response = Responses[400]({ message: "Failed to fetch order" });

  await Dynamo.scan({ TableName: "orders-table" })
    .then((data) => {
      response = Responses[200]({ message: "Fetched the order", data });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Failed to fetch order",
        err: err.toString(),
      });
    });
  return response;
};

exports.getActiveOrders = async (event) => {
  console.log("Event: ", event.body);

  return Responses[200]({ message: "Fetched active orders" });
};

exports.getCustomerOrders = async (event) => {
  console.log("Event: ", event.body);

  return Responses[200]({ message: "Fetched customer orders" });
};
