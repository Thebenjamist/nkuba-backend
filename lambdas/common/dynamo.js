const AWS = require("aws-sdk");

let options = {};

if (process.env.IS_OFFLINE) {
  options = {
    region: "localhost",
    endpoint: "http://localhost:8000",
  };
}

const documentClient = new AWS.DynamoDB.DocumentClient(options);

const Dynamo = {
  async get(id, TableName) {
    const params = {
      TableName,
      Key: {
        id,
      },
    };

    const data = await documentClient.get(params).promise();

    if (!data || !data.Item) {
      throw Error(
        `There was an error fetching the data of id of ${id} from ${TableName}`
      );
    }

    return data.Item;
  },

  async write(data, TableName) {
    if (!data.id) {
      throw new Error("No id in the data");
    }
    const params = {
      TableName,
      Item: data,
    };

    const exists = await documentClient
      .get({ TableName, Key: { id: data.id } })
      .promise();

    if (!exists || !exists.Item) {
      await documentClient.put(params).promise();
    } else {
      throw new Error("Entry already exists, try again");
    }
  },

  async scan({ FilterExpression, ExpressionAttributeValues, TableName }) {
    const params = {
      TableName,
      FilterExpression,
      ExpressionAttributeValues,
    };

    const data = await documentClient.scan(params).promise();

    if (!data || !data.Items) {
      throw Error(`There was an error fetching the data from ${TableName}`);
    }

    return data.Items;
  },

  async delete(id, TableName) {
    if (!id) {
      throw Error("No id in the data");
    }
    const params = {
      TableName,
      Key: {
        id,
      },
    };

    await documentClient.delete(params).promise();

    return;
  },

  async update({
    Key,
    UpdateExpression,
    ConditionExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  }) {
    if (!data.id) {
      throw Error("No id in the data");
    }
    const params = {
      TableName,
      Key,
      UpdateExpression,
      ConditionExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    };

    await documentClient.update(params).promise();

    return;
  },
};

module.exports = Dynamo;
