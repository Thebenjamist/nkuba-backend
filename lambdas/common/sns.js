const AWS = require("aws-sdk");

if (process.env.IS_OFFLINE) {
  const credentials = new AWS.SharedIniFileCredentials({ profile: "personal" });
  AWS.config.credentials = credentials;
}

const sns = new AWS.SNS({
  region: "eu-west-2",
});

const { env } = process.env;

const SendNotificationService = {
  async sendNotificationToSES({ to, message, textMessage, subject, source }) {
    const params = {
      to,
      subject,
      source,
      message,
      textMessage,
    };
    const send = () =>
      sns
        .publish({
          Message: JSON.stringify(params),
          TopicArn: `arn:aws:sns:eu-west-2:631409944731:email-topic-${env}`,
        })
        .promise();

    const res = await send()
      .then((data) => data)
      .catch((err) => {
        throw new Error(err);
      });

    return res;
  },
};

module.exports = SendNotificationService;
