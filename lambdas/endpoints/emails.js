var AWS = require("aws-sdk"); // must be npm installed to use
const Responses = require("../common/responses");
const SendEmailService = require("../common/ses");
const SendNotificationService = require("../common/sns");
const orderEmail = require("../../emails/newOrder");

exports.sendEmail = async (event) => {
  const req = event.Records[0].Sns.Message;
  const message = JSON.parse(req);
  let response = Responses[400]({ message: "Failed to send email" });
  await SendEmailService.sendEmail(message)
    .then((data) => {
      console.log("Sent email");
      response = Responses[200]({
        message: "Sent email successfully",
        data,
      });
    })
    .catch((err) => {
      console.log("Failed to send email: ", err);

      response = Responses[400]({
        message: err.message || "Failed to send email",
      });
    });
  return response;
};

exports.testEmail = async (event) => {
  let response = Responses[200]({ message: "Failed to trigger event" });

  await SendNotificationService.sendNotificationToSES({
    to: ["ben@nkubalogistics.com", "benho061995@gmail.com"],
    source: "orders",
    message: orderEmail.newOrder,
    textMessage: `An order has been placed, please check the dashboards for more information`,
    subject: `New Order  - ${new Date().toDateString()}`,
  })
    .then((res) => {
      response = Responses[200]({
        message: "Created order and sent Notification to Ben",
        data: res,
      });
    })
    .catch((err) => {
      response = Responses[400]({
        message: err.message || "Created order but failed to send notification",
      });
    });

  return response;
};
