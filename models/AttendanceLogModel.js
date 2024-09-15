import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const AttendanceLogs = db.define(
  "attendance_logs",
  {
    log_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Name of the referenced model
        key: "id",
      },
      onDelete: "CASCADE",
    },
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    check_out_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    indexes: [
      {
        name: "idx_check_in_time",
        fields: ["check_in_time"],
      },
    ],
  }
);

export default AttendanceLogs;
