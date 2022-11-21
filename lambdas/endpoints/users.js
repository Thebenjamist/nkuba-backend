const Responses = require("../common/responses");
const Dynamo = require("../common/dynamo");
const Cognito = require("../common/cognito");

exports.createUser = async (event) => {
  const request = JSON.parse(event.body);
  let response = Responses[400]({ message: "Failed to create user" });

  await Cognito.create({
    email: request.email,
    password: request.password,
    ...request,
  })
    .then(async (res) => {
      response = Responses[200]({
        message: "Created the user",
        res,
      });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Failed to create user",
        err: err.message,
      });
    });
  return response;
};

exports.changeUserRole = async (event) => {
  const request = JSON.parse(event.body);
  let response = Responses[400]({ message: "Failed to change user role" });

  if (!request || !request.email || !request.role) {
    return Responses[400]({
      message: "Failed to update role, please include email and new role",
    });
  }

  await Cognito.changeUserRole({
    email: request.email,
    role: request.role,
  })
    .then(async (res) => {
      response = Responses[200]({
        message: "Changed the user role",
        res,
      });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Failed to change user role",
        err: err.message,
      });
    });
  return response;
};

exports.signIn = async (event) => {
  const request = JSON.parse(event.body);
  let response = Responses[400]({ message: "Failed to sign in user" });

  await Cognito.authenticate({
    email: request.email,
    password: request.password,
  })
    .then((data) => {
      response = Responses[200]({
        message: "Signed in the user",
        data,
      });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Failed to sign in user",
        err: err.message,
      });
    });
  return response;
};

exports.signOut = async (event) => {
  const request = JSON.parse(event.body);
  let response = Responses[400]({ message: "Failed to sign out user" });

  await Cognito.signOut({ token: request.token })
    .then((data) => {
      response = Responses[200]({
        message: "Signed out user",
        data,
      });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Failed to sign out user",
        err: err.message,
      });
    });
  return response;
};

exports.checkSession = async (event) => {
  const request = JSON.parse(event.body);
  let response = Responses[400]({ message: "Session invalid" });

  await Cognito.checkSession({ token: request.token })
    .then(async (data) => {
      await Dynamo.get(data.Username, "users-table")
        .then((user) => {
          response = Responses[200]({
            message: "Session valid",
            data: { ...data, user },
          });
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Session invalid",
        err: err.message,
      });
    });

  return response;
};

exports.getUser = async (event) => {
  const request = event.pathParameters;
  let response = Responses[400]({ message: "Failed to fetch user" });

  await Dynamo.get(request.id, "users-table")
    .then((data) => {
      response = Responses[200]({
        message: "Fetched the user",
        data,
      });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Failed to fetch user",
        err: err.message,
      });
    });
  return response;
};

exports.resetPassword = async (event) => {
  const request = JSON.parse(event.body);
  let response = Responses[400]({ message: "Failed to reset password" });

  if (!request || !request.username) {
    response = Responses[400]({ message: "Please include username" });
    return response;
  }

  await Cognito.resetPassword({
    username: request.username,
  })
    .then((data) => {
      response = Responses[200]({
        message: "Reset password",
        data,
      });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Failed to reset user password",
        err: err.message,
      });
    });
  return response;
};

exports.setNewPassword = async (event) => {
  const request = JSON.parse(event.body);
  let response = Responses[400]({ message: "Failed to reset password" });

  if (!request || !request.username || !request.code || !request.password) {
    response = Responses[400]({ message: "Missing fields in request" });
    return response;
  }

  await Cognito.setNewPassword({
    username: request.username,
    code: request.code,
    password: request.password,
  })
    .then((data) => {
      response = Responses[200]({
        message: "Successfully set new password",
        data,
      });
    })
    .catch((err) => {
      response = Responses[400]({
        message: "Failed to set new user password",
        err: err.message,
      });
    });
  return response;
};
