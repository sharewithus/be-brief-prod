import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken);

    if (!refreshToken) return res.sendStatus(401);

    const user = await User.findOne({
      where: { refresh_token: refreshToken },
    });
    console.log(user);

    if (!user) return res.sendStatus(401);
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        console.log(err);
        if (err) return res.sendStatus(403);
        const nip = user.nip;
        const nama = user.nama;
        const accessToken = jwt.sign(
          { nip, nama },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "15s",
          }
        );

        res.status(200).json({ accessToken });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
