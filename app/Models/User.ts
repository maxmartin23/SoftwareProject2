import mongoose from "mongoose";
const { Schema } = mongoose;
import Hash from "@ioc:Adonis/Core/Hash";
import Encryption from "@ioc:Adonis/Core/Encryption";

const userSchema = new Schema({
  userId: String,
  userType: {
    type: Number,
    required: true,
    enum: [1, 2],
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: String,
  password: String,
  address: {
    street: String,
    city: String,
    province: String,
  },
  status: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// userSchema.pre("save", async function (next) {
//   this.firstName = Encryption.encrypt(this.firstName.trim());
//   this.lastName = Encryption.encrypt(this.lastName.trim());
//   this.password = await Hash.make(this.password);
//   this.updatedAt = Date.now();
//   const { street, city, province } = this.address;
//   this.address = {
//     street: Encryption.encrypt(street.trim()),
//     city: Encryption.encrypt(city.trim()),
//     province: Encryption.encrypt(province.trim()),
//   };
//   next();
// });

userSchema.post("init", function (next) {
  const { street, city, province } = this.address;
  this.firstName = Encryption.decrypt(this.firstName);
  this.lastName = Encryption.decrypt(this.lastName);
  this.address = {
    street: Encryption.decrypt(street),
    city: Encryption.decrypt(city),
    province: Encryption.decrypt(province),
  };
});

mongoose.model("User", userSchema);
