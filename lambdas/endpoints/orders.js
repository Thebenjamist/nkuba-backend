const Responses = require("../common/responses");
const Dynamo = require("../common/dynamo");
const { uuid } = require("uuidv4");

exports.createOrder = async (event) => {
  const request = JSON.parse(event.body);

  const id = uuid();
  request.id = id;
  request.status = "pending";

  let response = Responses[400]({ message: "Failed to create order" });

  await Dynamo.write(request, "orders-table")
    .then((res) => {
      response = Responses[200]({ message: "Created the order", res });
    })
    .catch((err) => {
      response = Responses[400]({
        message: err.message || "Failed to create order",
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
      response = Responses[400]({
        message: "Failed to fetch order",
        err: err.toString(),
      });
    });
  return response;
};

exports.getOrderByRef = async (event) => {
  const request = event.pathParameters;
  let response = Responses[400]({ message: "Failed to fetch order" });

  await Dynamo.get(request.id, "orders-table")
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

exports.updateOrder = async (event) => {
  const request = JSON.parse(event.body);
  let response = Responses[400]({ message: "Failed to update order" });

  await Dynamo.update({ Key: { id: request.id }, UpdateExpression })
    .then((res) => {
      response = Responses[200]({ message: "Updated the order", res });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Failed to update order",
        err: err.toString(),
      });
    });
  return response;
};

exports.deleteOrder = async (event) => {
  const request = JSON.parse(event.body);
  let response = Responses[400]({ message: "Failed to delete order" });

  await Dynamo.delete(request.id, "orders-table")
    .then((res) => {
      response = Responses[200]({ message: "Deleted the order", res });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Failed to Delete order",
        err: err.toString(),
      });
    });
  return response;
};

exports.getAllOrders = async (event) => {
  const request = event.pathParameters;
  let response = Responses[400]({ message: "Failed to fetch order" });

  await Dynamo.scan({ TableName: "orders-table" })
    .then((data) => {
      response = Responses[200]({ message: "Fetched all orders", data });
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
