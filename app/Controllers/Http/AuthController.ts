/*
Author: Max Martin
2022 April 9
This class contains all authentication logic
*/

import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import mongoose from "mongoose";
import Env from "@ioc:Adonis/Core/Env";
import { v4 as uuid } from "uuid";
const User = mongoose.model("User");
const jwt = require("jsonwebtoken");
import Hash from "@ioc:Adonis/Core/Hash";
import createShop from "App/Helpers/CreateShop";
const Shop = mongoose.model("Shop");
import Hash from "@ioc:Adonis/Core/Hash";
import Encryption from "@ioc:Adonis/Core/Encryption";




export default class AuthController {
  //Allows users to create new accounts, returns the new account info
  public async signUp({ request, response }: HttpContextContract) {
    const { email, userType, password, address, firstName, lastName } =
      request.all();
    const validator = require("email-validator");
    if (!userType || [1, 2].indexOf(userType) === -1)
      return response.badRequest({ error: "User type is invalid." });
    if (!firstName || !lastName)
      return response.badRequest({
        error: "Your first name and last name are required.",
      });
    if (!validator.validate(email))
      return response.badRequest({
        error: "Email is invalid.",
      });
    if (password?.length < 6)
      return response.badRequest({
        error: "Password must be at least 6 characters long.",
      });

    const normalize = require("normalize-email");
    const normalizedEmail = normalize(email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (!!existingUser)
      return response.conflict({
        error: "This email is already in use.",
      });

    const userId = uuid();
    let newShop = null;
    if (userType === 2) {
      const { shop } = request.body();
      if (!shop)
        return response.badRequest({
          error: "Please enter your shop's details.",
        });
      const createdShop = await createShop(userId, shop);
      if (!createdShop)
        return response.badRequest({
          error:
            "Something went wrong with creating your shop. Please try again.",
        });
      newShop = createdShop;
    }
    await User.create({
      userId,
      userType,
      email: normalizedEmail,
      firstName: Encryption.encrypt(firstName),
      lastName: Encryption.encrypt(lastName),
      address:{
        street: Encryption.encrypt(address.street),
        city: Encryption.encrypt(address.city),
        state: Encryption.encrypt(address.state),
      },
      password: await Hash.make(password),
      status: 1,
    });

    //return token with user details
    const token = jwt.sign({ sub: userId }, Env.get("JWT_SECRET"), {
      expiresIn: "7d",
    });
    const newUser = await User.findOne({ userId });
    if (newShop)
      newUser!["shop"] = await Shop.findOne({ shopId: newShop["shopId"] });
    return response.created({
      user: newUser,
      token,
    });
  }

  public async signIn({ request, response }: HttpContextContract) {
    const { email, password } = request.all();

    const validator = require("email-validator");
    if (!validator.validate(email))
      return response.badRequest({
        error: "Email is invalid.",
      });
    const normalize = require("normalize-email");
    const normalizedEmail = normalize(email);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await Hash.verify(user["password"], password)))
      return response.badRequest({ error: "Email or password is incorrect." });

    //return token with user details
    const token = jwt.sign({ sub: user["userId"] }, Env.get("JWT_SECRET"), {
      expiresIn: "7d",
    });
    const shop =
      user["userType"] === 2
        ? await Shop.findOne({ userId: user["userId"] })
        : null;
    return { user, token, shop };
  }
}
