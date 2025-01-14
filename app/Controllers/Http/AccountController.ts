/*
Author: Max Martin
2022 April 9
This class contains the logic for all routes related to accounts
*/

import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
const mongoose = require("mongoose");
const User = mongoose.model("User");
import Hash from "@ioc:Adonis/Core/Hash";
import Encryption from "@ioc:Adonis/Core/Encryption";

export default class AccountController {
  //Returns the current user info
  public async me({ request, response }) {
    const user = request["user"]!;
    return user;
  }

  /*
    Updates a user's account
    @param {string?} firstName
    @param {string?} lastName
    @param {object?} address
  */
  public async update({ request, response }: HttpContextContract) {
    const user = request["user"]!;
    const { firstName, lastName, address } = request.body();
    user.firstName = Encryption.encrypt(
      firstName.length > 0 ? firstName : user.firstName
    );
    user.lastName = Encryption.encrypt(
      lastName.length > 0 ? lastName : user.lastName
    );
    if (address) {
      const { street, city, province } = address;
      user.address = {
        street: Encryption.encrypt(street.length > 0 ? street : user.street),
        city: Encryption.encrypt(city.length > 0 ? city : user.city),
        province: Encryption.encrypt(
          province.length > 0 ? province : user.province
        ),
      };
    }
    await user.save();

    const updatedUser = await User.find({ userId: user.userId });
    return updatedUser;
  }

  /*
    Updates a user's password
    @param {string} oldPassword
    @param {string} newPassword
  */
  public async changePassword({ request, response }: HttpContextContract) {
    const user = request["user"]!;
    const { oldPassword, newPassword } = request.body();
    if (!(await Hash.verify(user.password, oldPassword)))
      return response.badRequest({ error: "Password does not match." });

    user.password = newPassword;
    await user.save();
  }
}
