const AWS = require("aws-sdk");
const Dynamo = require("./dynamo");

const { user_pool_client_id, user_pool_id } = process.env;

if (process.env.IS_OFFLINE) {
  var credentials = new AWS.SharedIniFileCredentials({ profile: "personal" });
  AWS.config.credentials = credentials;
}

const cognito = new AWS.CognitoIdentityServiceProvider({ region: "eu-west-2" });

const Cognito = {
  async create({ email, password, name, contact, role }) {
    const UserAttributes = [{ Name: "custom:role", Value: role || "customer" }];
    const createCognitoUser = () =>
      cognito
        .signUp({
          ClientId: user_pool_client_id,
          Password: password,
          Username: email,
          UserAttributes,
        })
        .promise();

    const res = await createCognitoUser()
      .then(async (data) => {
        const params = {
          id: data.UserSub,
          email,
          name,
          contact,
        };

        const dynamoUser = await Dynamo.write(params, "users-table")
          .then((data) => {
            return data;
          })
          .catch((err) => {
            throw new Error(err);
          });
        return dynamoUser;
      })
      .catch((err) => {
        throw new Error(err);
      });

    return res;
  },

  async authenticate({ email, password }) {
    const signInUser = () =>
      cognito
        .adminInitiateAuth({
          AuthFlow: "ADMIN_NO_SRP_AUTH",
          ClientId: user_pool_client_id,
          UserPoolId: user_pool_id,

          AuthParameters: { USERNAME: email, PASSWORD: password },
        })
        .promise();
    return await signInUser()
      .then((data) => data)
      .catch((err) => {
        throw new Error(err);
      });
  },

  async checkSession({ token }) {
    const getUser = () =>
      cognito
        .getUser({
          AccessToken: token,
        })
        .promise();
    return await getUser()
      .then((data) => data)
      .catch((err) => {
        throw new Error(err);
      });
  },

  async signOut({ token }) {
    const globalSignOut = () =>
      cognito
        .globalSignOut({
          AccessToken: token,
        })
        .promise();
    return await globalSignOut()
      .then((data) => data)
      .catch((err) => {
        throw new Error(err);
      });
  },

  async resetPassword({ username }) {
    const forgotPassword = () =>
      cognito
        .forgotPassword({
          ClientId: user_pool_client_id,
          Username: username,
        })
        .promise();

    const res = await forgotPassword()
      .then((res) => res)
      .catch((err) => {
        throw new Error(err);
      });

    return res;
  },

  async setNewPassword({ username, code, password }) {
    const setPassword = () =>
      cognito
        .confirmForgotPassword({
          ClientId: user_pool_client_id,
          ConfirmationCode: code,
          Password: password,
          Username: username,
        })
        .promise();

    const res = await setPassword()
      .then((res) => res)
      .catch((err) => {
        throw new Error(err);
      });

    return res;
  },

  async changeUserRole({ email, role }) {
    const UserAttributes = [{ Name: "custom:role", Value: role }];

    const updateCognitoUser = () =>
      cognito
        .adminUpdateUserAttributes({
          Username: email,
          UserPoolId: user_pool_id,
          UserAttributes,
        })
        .promise();

    const res = await updateCognitoUser()
      .then((data) => data)
      .catch((err) => {
        throw new Error(err);
      });

    return res;
  },
};

module.exports = Cognito;
