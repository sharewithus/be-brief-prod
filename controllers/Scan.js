import User from "../models/UserModel.js";
import CryptoJS from "crypto-js";
// import moment from "moment";
import moment from "moment-timezone";

import AttendanceLogs from "../models/AttendanceLogModel.js";

function decryptData(encryptedData, secretKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedData;
}

export const Scanning = async (req, res) => {
  let nipDecrypt = decryptData(req.body.qr_code, "5gk85kyyp5ak");
  const peserta = await User.findOne({
    where: {
      nip: nipDecrypt,
    },
  });

  if (!peserta)
    return res
      .status(404)
      .json({ msg: "Data Peserta briefing tidak ditemukan" });

  const penscan = await User.findOne({
    where: {
      nip: req.nip,
    },
  });

  if (penscan.role.toLowerCase() == peserta.role.toLowerCase()) {
    return res.status(400).json({
      nama: peserta.nama,
      nip: peserta.nip,
      msg: "Role yang sama tidak bisa melakukan scan",
    });
  }

  // CEK SCAN
  if (penscan.role.toLowerCase() == "operator") {
    return res.status(400).json({
      nama: peserta.nama,
      nip: peserta.nip,
      msg: "Role anda tidak bisa melakukan scan",
    });
  }

  // CEK AREA
  if (penscan.area_base.toLowerCase() != peserta.area_scan.toLowerCase()) {
    return res.status(400).json({
      nama: peserta.nama,
      nip: peserta.nip,
      msg: `${peserta.nama} (${peserta.nip}) silakan melakukan scan di area ${peserta.area_scan}!`,
    });
  }

  if (
    penscan.role.toLowerCase() == "supervisor" &&
    peserta.role.toLowerCase() == "foreman"
  ) {
    try {
      await AttendanceLogs.create({
        user_id: peserta.id,
        check_in_time: moment()
          .tz("Asia/Jakarta")
          .format("YYYY-MM-DD HH:mm:ss"),
      });
    } catch (error) {
      console.error("Error inserting attendance log:", error);
      return res.status(500).json({
        msg: `Tidak bisa record presensi, terjadi kesalahan pada server`,
      });
    }

    res.status(200).json({
      nip: peserta.nip,
      nama: peserta.nama,
      grup: peserta.grup,
      role: peserta.role,
      mesin: peserta.mesin,
      tanggal: moment().format("dddd, D-MMMM-YYYY"),
      jam: moment().format("HH:mm:ss"),
      msg:
        "Terimakasih " +
        peserta.nama +
        ", anda telah bergabung briefing produksi hari ini, semoga harimu menyenangkan",
    });
  } else if (
    penscan.role.toLowerCase() == "foreman" &&
    peserta.role.toLowerCase() == "operator"
  ) {
    try {
      await AttendanceLogs.create({
        user_id: peserta.id,
        check_in_time: moment()
          .tz("Asia/Jakarta")
          .format("YYYY-MM-DD HH:mm:ss"),
      });
    } catch (error) {
      console.error("Error inserting attendance log:", error);
      return res.status(500).json({
        msg: `Tidak bisa record presensi, terjadi kesalahan pada server`,
      });
    }

    res.status(200).json({
      nip: peserta.nip,
      nama: peserta.nama,
      grup: peserta.grup,
      role: peserta.role,
      mesin: peserta.mesin,
      tanggal: moment().format("dddd, D-MMMM-YYYY"),
      jam: moment().format("HH:mm:ss"),
      msg:
        "Terimakasih " +
        peserta.nama +
        ", anda telah bergabung briefing produksi hari ini, semoga harimu menyenangkan",
    });
  } else {
    return res.status(400).json({
      nama: peserta.nama,
      nip: peserta.nip,
      msg: `${peserta.nama} (${peserta.nip}) tidak bisa melakukan scan kepada ${penscan.role}!`,
    });
  }
};
