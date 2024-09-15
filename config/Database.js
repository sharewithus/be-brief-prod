import { Sequelize } from "sequelize";

const db = new Sequelize("sql12731506", "sql12731506", "h45LrWBd8y", {
  host: "sql12.freemysqlhosting.net",
  dialect: "mysql",
  timezone: "+07:00",
});

export default db;
