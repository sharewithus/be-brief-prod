import express from "express";
import cors from "cors";
// import session from "express-session";
import dotenv from "dotenv";
// import db from "./config/Database.js";
// import SequelizeStore from "connect-session-sequelize";
// import UserRoute from "./routes/UserRoute.js";
// import ProductRoute from "./routes/ProductRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import Users from "./models/UserModel.js";
import AttendanceLogs from "./models/AttendanceLogModel.js";
import cookieParser from "cookie-parser";
import https from "https";
import fs from "fs";
dotenv.config();
const app = express();

// const sessionStore = SequelizeStore(session.Store);

// const store = new sessionStore({
//   db: db,
// });

Users.hasMany(AttendanceLogs, { foreignKey: "user_id" });
AttendanceLogs.belongsTo(Users, { foreignKey: "user_id" });

// (async () => {
//   await db.sync({ alter: true });
// })();

// app.use(
//   session({
//     secret: process.env.SESS_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     store: store,
//     cookie: {
//       secure: false,
//     },
//   })
// );

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost",
      "http://localhost:80",
      "https://localhost",
      "http://localhost:5500",
      "http://localhost:8000",
      "http://127.0.0.1:5500",
      "http://localhost/operating-system/PTFL/frontend/",
      "https://localhost/operating-system/PTFL/frontend/",
      "https://172.20.10.3",
      "http://172.20.10.3",
      "http://kmi.idlaps.com",
      "https://kmi.idlaps.com",
    ],
  })
);

app.use(cookieParser());
app.use(express.json());
// app.use(UserRoute);
// app.use(ProductRoute);
app.use(AuthRoute);
// store.sync();

// const options = {
//   key: fs.readFileSync("./server.key"),
//   cert: fs.readFileSync("./server.cert"),
// };

// console.log(options);
const server = app.listen(process.env.APP_PORT || 8000, () => {
  console.log("Server up and running...");
});
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

// https.createServer(options, app).listen(8000, () => {
//   console.log("Backend server is running on https://172.20.10.3:8000");
// });
