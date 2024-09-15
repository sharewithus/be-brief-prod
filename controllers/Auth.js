import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const Login = async (req, res) => {
  const user = await User.findOne({
    where: {
      nip: req.body.nip,
    },
  });
  if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
  const match = user.password === req.body.password;
  if (!match) return res.status(400).json({ msg: "Maaf password salah" });

  const nip = user.nip;
  const nama = user.nama;

  const accessToken = jwt.sign({ nip, nama }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign(
    { nip, nama },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  await User.update(
    { refresh_token: refreshToken },
    {
      where: {
        nip: nip,
      },
    }
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    secure: true,
  });

  res.status(200).json({ accessToken });
};

export const Me = async (req, res) => {
  console.log(req.session);
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
  }
  const user = await User.findOne({
    attributes: [
      "nip",
      "nama",
      "grup",
      "role",
      "mesin",
      "area_base",
      "area_scan",
    ],
    where: {
      nip: req.session.userId,
    },
  });
  if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
  res.status(200).json(user);
};

export const logOut = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);
  const user = await User.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!user) return res.sendStatus(204);
  const userId = user.nip;
  await User.update(
    { refresh_token: null },
    {
      where: {
        nip: userId,
      },
    }
  );
  res.clearCookie("refreshToken");
  return res.sendStatus(200);
};
