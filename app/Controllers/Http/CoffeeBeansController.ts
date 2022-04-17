/*
Author: Max Martin
2022 April 9
This class contains the logic for CRUD operations on products
*/

import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
const mongoose = require("mongoose");
const CoffeeBean = mongoose.model("CoffeeBean");
const Shop = mongoose.model("Shop");
import { v4 as uuid } from "uuid";

export default class CoffeeBeansController {
  /**
   *
   *  Gets all coffee beans from a user's shop
   * @returns [CoffeeBean]
   */
  public async getAll({ request, response }) {
    const userId = request["user"]!.userId;
    const shop = await Shop.findOne({ userId });
    const coffeeBeans = await CoffeeBean.find({ shopId: shop.shopId });
    return coffeeBeans;
  }

  /**
   *
   * Creates a new coffee bean
   *  @param {string} name
   * @param {string?} description
   * @param {string} specie
   *  @param {string} origin
   * @param {string} roastingLevel
   * @param {number} price
   * @returns {CoffeeBean}
   *
   */
  public async create({ request, response }) {
    const userId = request["user"]!.userId;
    const shop = await Shop.findOne({ userId });
    if (!shop) return response.notFound({ error: "Shop not found" });
    const { name, description, specie, origin, roastingLevel, price } =
      request.body();

    const newBean = CoffeeBean.create({
      coffeeBeanId: uuid(),
      name,
      description,
      specie,
      origin,
      roastingLevel,
      price,
      shopId: shop.shopId,
    });
    return response.created(newBean);
  }

  public async details({ request, response }) {
    const { id: coffeeBeanId } = request.qs();

    const coffeeBean = await CoffeeBean.findOne({ coffeeBeanId });
    if (!coffeeBean)
      return response.notFound({ error: "CoffeeBean not found" });
    return response.ok(coffeeBean);
  }


  /**
   * Updates an existing coffee bean
   * @param {string} coffeeBeanId
   * @param {string} name
   * @param {string?} description
   * @param {string} specie
   * @param {string} origin
   * @param {string} roastingLevel
   * @param {number} price
   * @returns null
   */

  public async update({ request, response }) {
    const {
      coffeeBeanId,
      name,
      description,
      specie,
      origin,
      roastingLevel,
      price,
    } = request.body();

    const coffeeBean = await CoffeeBean.findOne({ coffeeBeanId });
    if (!coffeeBean)
      return response.notFound({ error: "CoffeeBean not found" });

    coffeeBean.name = name;
    coffeeBean.description = description;
    coffeeBean.specie = specie;
    coffeeBean.origin = origin;
    coffeeBean.roastingLevel = roastingLevel;
    coffeeBean.price = price;

    await coffeeBean.save();
    return response.ok(coffeeBean);
  }

  public async delete({ request, response }) {
    const shopId = await Shop.find({ userId: request["user"]!.userId });
    const coffeeBeanId = request.input("coffeeBeanId");
    if (!coffeeBeanId)
      return response.badRequest({ error: "Missing coffeeBeanId" });
    const coffeeBean = await CoffeeBean.findOne({ coffeeBeanId });
    if (!coffeeBean)
      return response.notFound({ error: "CoffeeBean not found" });
    if (coffeeBean.shopId !== shopId.shopId)
      return response.unauthorized({ error: "Unauthorized" });
    await coffeeBean.delete();
    return response.noContent();
  }
}
