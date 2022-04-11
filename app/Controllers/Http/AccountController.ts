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
  public async me({request, response}){
    const user = request["user"]!;
    return user
  }

  //Updates the user's info
  public async update({ request, response }: HttpContextContract) {
    const user = request["user"]!;
    const { firstName, lastName, address } = request.body();
    //TODO add empty string validations
    user.firstName = firstName.length > 0 ? Encryption.encrypt(firstName) : user.firstName;
    user.lastName = lastName.length > 0 ? Encryption.encrypt(lastName) : user.lastName;
    if (address) {
      const { street, city, province } = address;
      user.address = {
        street: street.length > 0 ? Encryption.encrypt(street) : user.address.street,
        city: city.length > 0 ? Encryption.encrypt(city) : user.address.city,
        province: province.length > 0 ? Encryption.encrypt(province) : user.address.province,
      };
    }
    await user.save()

    const updatedUser = await User.find({userId: user.userId});
    return updatedUser
    
  }

  //Updates the user's password
  public async changePassword({ request, response }: HttpContextContract) {
    const user = request["user"]!;
    const { oldPassword, newPassword } = request.body();
    if (!(await Hash.verify(user.password, oldPassword)))
      return response.badRequest({ error: "Password does not match." });

    user.password = newPassword;
    await user.save();
  }
}
