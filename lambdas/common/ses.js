var AWS = require("aws-sdk");

if (process.env.IS_OFFLINE) {
  var credentials = new AWS.SharedIniFileCredentials({ profile: "personal" });
  AWS.config.credentials = credentials;
}

const ses = new AWS.SES({
  region: "eu-west-2",
});

const SendEmailService = {
  async sendEmail({ to, message, textMessage, subject, source }) {
    var params = {
      Destination: {
        ToAddresses: to,
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: message,
          },
          Text: {
            Charset: "UTF-8",
            Data: textMessage,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: `${source}@nkubalogistics.com`,
    };

    const send = () => ses.sendEmail(params).promise();

    const res = await send()
      .then((data) => data)
      .catch((err) => {
        throw new Error(err);
      });

    return res;
  },
};

module.exports = SendEmailService;
