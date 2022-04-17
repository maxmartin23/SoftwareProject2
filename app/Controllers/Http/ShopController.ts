/*
Author: Max Martin
2022 April 9
This class contains the logic for storeowners
*/

import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
const mongoose = require("mongoose");
const Shop = mongoose.model("Shop");

export default class ShopController {

  
  /**
   * Gets a user's shop's details
   * @returns {Shop}
   */
  public async shopDetails({ request, response }: HttpContextContract) {
    const userId = request["user"]["userId"];
    const shop = await Shop.findOne({ userId });
    if (!shop) return response.status(404).json({ error: "Shop not found" });

    return response.ok(shop);
  }
  /**
   *  Updates a user's shop
   * @param {Shop} shop
   * @returns {Shop}
   */
  public async update({ request, response }: HttpContextContract) {
    const userId = request["user"]["userId"];
    const shop = await Shop.findOne({ userId });
    if (!shop) return response.status(404).json({ error: "Shop not found" });

    const { name, description, address, location } = request.body();
    const { lat, lng } = location;

    shop.name = name || shop.name;
    shop.description = description || shop.description;
    shop.address = address || shop.address;
    shop.location.lat = lat;
    shop.location.lng = lng;
    await shop.save();

    return response.ok(shop);
  }
}
