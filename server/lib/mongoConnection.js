import mongoose from "mongoose";
import config from "../../config/index";

const log = config[process.env.NODE_ENV].log();

const connectToMongoAtlas = async (key) => {
  try {
    await mongoose.connect(key, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    return log.info("Connected To DataBase");
  } catch (error) {
    return log.error(error);
  }
};

export default connectToMongoAtlas;
