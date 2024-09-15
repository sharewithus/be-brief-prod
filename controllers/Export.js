import moment from "moment";
import LogAttendance from "../models/AttendanceLogModel.js";
import { Op } from "sequelize";
import Users from "../models/UserModel.js";
import AttendanceLogs from "../models/AttendanceLogModel.js";

export const Attendances = async (req, res) => {
  try {
    const { date } = req.body; // Assuming the client sends the date in "YYYY-MM-DD" format

    // Calculate the start and end of the day for the specified date
    const startOfDay = moment(date)
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    const endOfDay = moment(date).endOf("day").format("YYYY-MM-DD HH:mm:ss");

    // Find all records with check_in_time between the start and end of the day
    const attendanceLogs = await LogAttendance.findAll({
      attributes: ["user_id", "check_in_time"],
      where: {
        check_in_time: {
          [Op.between]: [startOfDay, endOfDay], // Filters by the date range
        },
      },
      include: [
        {
          model: Users, // Join with Users table
          attributes: ["nip", "nama", "role", "grup", "area_scan"], // Specify which columns to retrieve from Users
        },
      ],
    });

    // Return the found data in JSON format
    res.status(200).json(attendanceLogs);
  } catch (error) {
    console.error("Error fetching attendance logs:", error);
    res
      .status(500)
      .json({ msg: "Terjadi kesalahan ketika mengambil data presensi" });
  }
};

export const getUsersWithoutAttendance = async (req, res) => {
  try {
    const { date } = req.body; // Assuming the client sends the date in "YYYY-MM-DD" format

    // Calculate the start and end of the day for the specified date
    const startOfDay = moment(date)
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    const endOfDay = moment(date).endOf("day").format("YYYY-MM-DD HH:mm:ss");

    const usersWithoutAttendance = await Users.findAll({
      attributes: ["id", "nip", "nama", "role", "grup", "area_scan"], // Select specific columns from Users
      include: [
        {
          model: AttendanceLogs,
          required: false, // LEFT JOIN
          where: {
            check_in_time: {
              [Op.between]: [startOfDay, endOfDay], // Time range for attendance logs
            },
          },
          attributes: [], // Don't include attendance log attributes in the result
        },
      ],
      where: {
        "$attendance_logs.log_id$": {
          [Op.is]: null, // WHERE al.log_id IS NULL
        },
      },
    });

    // Return the result as JSON
    res.status(200).json(usersWithoutAttendance);
  } catch (error) {
    console.error("Error fetching users without attendance:", error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan ketika mengambil data absen" });
  }
};
