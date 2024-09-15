import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import fs from "fs";
import { createCanvas, loadImage } from "canvas";
import CryptoJS from "crypto-js";

import User from "../models/UserModel.js";

function encryptData(data, secretKey) {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
}

async function generateQRCode(data) {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(data, { width: 450, height: 450 }, (err, url) => {
      if (err) reject(err);
      resolve(url);
    });
  });
}

async function createPDFWithQRCodes(users) {
  const doc = new PDFDocument({ autoFirstPage: false });
  doc.pipe(fs.createWriteStream("output.pdf")); // Output file

  //   const cmToPt = (cm) => cm * 28.3465; // Convert cm to points (1cm = ~28.35 points)
  const cmToPt = (cm) => cm * 28.3465; // Convert cm to points (1cm = ~28.35 points)

  // Set page dimensions and margins
  const pageWidth = cmToPt(21); // A4 width in points
  const pageHeight = cmToPt(29.7); // A4 height in points
  const margin = cmToPt(2); // 2cm margin around the page

  const qrSize = cmToPt(4.5); // 4.5 cm QR code
  const labelHeight = cmToPt(0.5); // 1cm for NIP and name text

  const spaceBetweenItems = cmToPt(1); // Space between QR codes
  const qrPerRow = 3; // 3 QR codes per row
  const qrPerColumn = 3; // 3 QR codes per column (9 total per page)

  // Calculate the starting X and Y coordinates for the first QR code
  const startX = margin;
  const startY = margin;

  let x = startX;
  let y = startY;

  //   for (let user of users) {
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    // Generate the QR code for the NIP
    const encryptedData = encryptData(user.nip.toString(), "5gk85kyyp5ak");
    const qrCodeDataUrl = await generateQRCode(encryptedData);

    // Convert the base64 QR code to an image and draw it on canvas
    const canvas = createCanvas(450, 450);
    const ctx = canvas.getContext("2d");
    const img = await loadImage(qrCodeDataUrl);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing
    ctx.drawImage(img, 0, 0, 450, 450); // Ensure image is properly resized to 450x450 pixels

    // Save QR code as an image buffer
    const qrImageBuffer = canvas.toBuffer("image/png");

    if (i % (qrPerRow * qrPerColumn) === 0) {
      doc.addPage({ size: [pageWidth, pageHeight] });
      x = startX;
      y = startY;
    }

    // Draw the QR code on the PDF at the current x, y position
    doc.image(qrImageBuffer, x, y, {
      fit: [qrSize, qrSize], // 4.5 cm x 4.5 cm
    });

    // Add NIP and name below the QR code
    doc.fontSize(10).text(`${user.nip}`, x, y + qrSize, {
      width: qrSize,
      align: "center",
    });
    doc.text(`${user.nama}`, x, y + qrSize + labelHeight, {
      width: qrSize,
      align: "center",
    });

    // Move x position for the next QR code
    x += qrSize + spaceBetweenItems;

    // If we reach the end of a row, move to the next row
    if ((i + 1) % qrPerRow === 0) {
      x = startX; // Reset x to start of the row
      y += qrSize + labelHeight + spaceBetweenItems; // Move y down to the next row
    }

    // Add a new page for each QR code in the PDF
    // doc.addPage({
    //   size: [cmToPt(21), cmToPt(29.7)], // A4 size: 21cm x 29.7cm
    // });

    // Draw the QR code on the PDF with size 4.5 cm x 4.5 cm
    // doc.image(qrImageBuffer, {
    //   fit: [cmToPt(4.5), cmToPt(4.5)], // 4.5 cm x 4.5 cm
    //   align: "center",
    //   valign: "top",
    // });

    // Add NIP and name below the QR code
    // doc.moveDown();
    // doc.fontSize(12).text(`${user.nip}`, { align: "center" });
    // doc.text(`${user.nama}`, { align: "center" });

    // doc.moveDown(2); // Space after each QR code section
  }

  // Finalize the PDF file
  doc.end();
}

export const GenerateQRCode = async (req, res) => {
  try {
    // Connect to the database and fetch data
    // await sequelize.authenticate();
    const users = await User.findAll({
      attributes: ["nip", "nama"],
    });

    if (users.length === 0) {
      console.log("No users found.");
      return;
    }

    // Create PDF with QR codes for fetched users
    await createPDFWithQRCodes(users);
    console.log("PDF generated successfully.");
    res.status(200).json({ msg: "PDF generated successfully." });
  } catch (err) {
    console.error("Error:", err);
    res.status(400).json({ msg: "Error : " + err });
  }
};
// Function to generate QR code and return a base64 image
