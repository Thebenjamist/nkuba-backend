const AWS = require("aws-sdk");

let options = {};

if (process.env.IS_OFFLINE) {
  options = {
    region: "localhost",
    endpoint: "http://localhost:8000",
  };
}
const { env } = process.env;

const documentClient = new AWS.DynamoDB.DocumentClient(options);

const Dynamo = {
  async get(id, TableName) {
    const params = {
      TableName: `${TableName}-${env}`,
      Key: {
        id,
      },
    };

    const data = await documentClient.get(params).promise();

    if (!data || !data.Item) {
      throw Error(
        `There was an error fetching the data of id of ${id} from ${TableName}-${env}`
      );
    }

    return data.Item;
  },

  async write(data, TableName) {
    let res;
    if (!data.id) {
      throw new Error("No id in the data");
    }
    const params = {
      TableName: `${TableName}-${env}`,
      Item: data,
    };

    const exists = await documentClient
      .get({ TableName: params.TableName, Key: { id: data.id } })
      .promise();

    if (!exists || !exists.Item) {
      res = await documentClient.put(params).promise();
    } else {
      console.log("Exists: ", exists);
      throw new Error("Entry already exists, try again");
    }

    return params.Item;
  },

  async scan({
    FilterExpression,
    ExpressionAttributeValues,
    TableName,
    ExpressionAttributeNames,
  }) {
    const params = {
      TableName: `${TableName}-${env}`,
      FilterExpression,
      ExpressionAttributeValues,
      ExpressionAttributeNames,
    };

    const data = await documentClient.scan(params).promise();

    if (!data || !data.Items) {
      throw new Error(
        `There was an error fetching the data from ${params.TableName}`
      );
    }

    if (data.Items.length === 0) {
      return [];
    }

    return data.Items;
  },

  async delete(id, TableName) {
    if (!id) {
      throw Error("No id in the data");
    }
    const params = {
      TableName: `${TableName}-${env}`,
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
    TableName,
  }) {
    if (!data.id) {
      throw Error("No id in the data");
    }
    const params = {
      TableName: `${TableName}-${env}`,
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
