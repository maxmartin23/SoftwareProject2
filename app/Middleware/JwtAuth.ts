import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
const jwt = require("jsonwebtoken");
import Env from "@ioc:Adonis/Core/Env";
const mongoose = require("mongoose");
const User = mongoose.model("User");



/**
 * Middleware to validate the JWT token
 */
export default class JwtAuth {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    const token = request.headers().authorization?.replace("Bearer ", "");
    if (!token) return response.unauthorized({ error: "Invalid token." });
    try {
      jwt.verify(token, Env.get("JWT_SECRET"));
    } catch (error) {
      return response.unauthorized({ error: "Token is expired or invalid." });
    }

    request["user"] = await User.findOne({ userId: jwt.decode(token).sub });
    await next();
  }
}
