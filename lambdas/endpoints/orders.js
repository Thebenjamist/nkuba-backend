const Responses = require("../common/responses");
const Dynamo = require("../common/dynamo");
const { uuid } = require("uuidv4");
const crypto = require("crypto");
const SendNotificationService = require("../common/sns");
const orderEmail = require("../../emails/newOrder");

exports.createOrder = async (event) => {
  const request = JSON.parse(event.body);

  const id = uuid();
  request.id = id;
  request.status = "pending";
  request.code = crypto
    .randomBytes(5)
    .toString("hex")
    .slice(0, 5)
    .toUpperCase();

  let response = Responses[400]({ message: "Failed to create order" });

  await Dynamo.write(request, "orders-table")
    .then(async (dynamo_res) => {
      response = Responses[200]({
        message: "Created the order",
        data: dynamo_res,
      });

      await SendNotificationService.sendNotificationToSES({
        to: ["ben@nkubalogistics.com", "benho061995@gmail.com"],
        source: "orders",
        message: orderEmail.newOrder,
        textMessage: `An order has been placed, please check the dashboard for more information`,
        subject: `New Order  - ${new Date().toDateString()}`,
      })
        .then((res) => {
          response = Responses[200]({
            message: "Created order and sent Notification to Ben",
            data: { res, dynamo_res },
          });
        })
        .catch((err) => {
          response = Responses[400]({
            message:
              err.message || "Created order but failed to send notification",
          });
        });
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
        err: err.message,
      });
    });
  return response;
};

exports.getOrderByRef = async (event) => {
  const request = event.pathParameters;
  let response = Responses[400]({ message: "Failed to fetch order" });

  const FilterExpression = "code = :code";
  const ExpressionAttributeValues = { ":code": request.reference };

  await Dynamo.scan({
    FilterExpression,
    ExpressionAttributeValues,
    TableName: "orders-table",
  })

    .then((data) => {
      if (data.length === 0) {
        throw new Error(`Order with reference ${request.reference} not found`);
      }
      response = Responses[200]({
        message: "Fetched the order",
        data: data[0],
      });
    })
    .catch((err) => {
      response = Responses[400]({
        message: err.message || "Failed to create order",
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
        err: err.message,
      });
    });
  return response;
};

exports.updateOrderStatus = async (event) => {
  const request = JSON.parse(event.body);
  let response = Responses[400]({ message: "Failed to update order" });

  if (!request || !request.id) {
    return Responses[400]({ message: "Please include order id" });
  }

  if (!request || !request.status) {
    return Responses[400]({ message: "Please include new status" });
  }

  await Dynamo.update({
    Key: { id: request.id },
    UpdateExpression: "set #order_status = :status",
    ExpressionAttributeNames: { "#order_status": "status" },
    ExpressionAttributeValues: { ":status": request.status },
    TableName: "orders-table",
  })
    .then((res) => {
      response = Responses[200]({ message: "Updated the order", res });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Failed to update order",
        err: err.message,
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
        err: err.message,
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
        err: err.message,
      });
    });
  return response;
};

exports.getActiveOrders = async (event) => {
  let response = Responses[400]({ message: "Failed to fetch orders" });

  const FilterExpression = "#order_status <> :status";
  const ExpressionAttributeValues = { ":status": "completed" };
  const ExpressionAttributeNames = { "#order_status": "status" };

  await Dynamo.scan({
    FilterExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames,
    TableName: "orders-table",
  })

    .then((data) => {
      response = Responses[200]({
        message: "Fetched the active orders",
        data,
      });
    })
    .catch((err) => {
      response = Responses[400]({
        message: err.message || "Failed to fetch active orders",
      });
    });
  return response;
};

exports.getCustomerOrders = async (event) => {
  const request = event.pathParameters;
  let response = Responses[400]({ message: "Failed to fetch orders" });

  const FilterExpression = "user_id = :user_id";
  const ExpressionAttributeValues = { ":user_id": request.id };

  await Dynamo.scan({
    FilterExpression,
    ExpressionAttributeValues,
    TableName: "orders-table",
  })

    .then((data) => {
      response = Responses[200]({
        message: "Fetched the customer's orders",
        data,
      });
    })
    .catch((err) => {
      response = Responses[400]({
        message: err.message || "Failed to fetch customer orders",
      });
    });
  return response;
};

exports.getContactOrders = async (event) => {
  const request = event.pathParameters;
  let response = Responses[400]({ message: "Failed to fetch orders" });

  const FilterExpression =
    request.contactType === "sender"
      ? "senderContact = :contact_number"
      : "recipientContact = :contact_number";

  const ExpressionAttributeValues = { ":contact_number": request.contact };

  await Dynamo.scan({
    FilterExpression,
    ExpressionAttributeValues,
    TableName: "orders-table",
  })

    .then((data) => {
      response = Responses[200]({
        message: "Fetched the customer's orders",
        data,
      });
    })
    .catch((err) => {
      response = Responses[400]({
        message: err.message || "Failed to fetch customer orders",
      });
    });

  return response;
};
