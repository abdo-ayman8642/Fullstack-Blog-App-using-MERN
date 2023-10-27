const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const fs = require("fs");
const path = require("path"); // Import the path module

const salt = bcrypt.genSaltSync(10);
const secret = "asdfe45we45w345wegw345werjktjwertkj";

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

mongoose.connect(
  "mongodb+srv://abdelrahmanayman8642:ru5phBlPjG8IJjEB@cluster0.fymrzt6.mongodb.net/"
);

function generateTemporaryPassword() {
  // Generate a random temporary password (e.g., 8 characters)
  return Math.random().toString(36).substring(2, 10);
}

app.use("/register", async (req, res) => {
  const { username, password, email, firstname, lastname } = req.body;
  try {
    const userDoc = await User.create({
      username,
      email,
      firstname,
      lastname,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  if (!userDoc) {
    res.status(404).json("wrong credentials");
    return;
  }
  const passOk = bcrypt.compareSync(password, userDoc?.password);
  if (passOk) {
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json("wrong credentials");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  try {
    const decoded = jwt.verify(token, secret, {});
  } catch (err) {
    res.json(err);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });
    res.json(postDoc);
  });
});

app.get("/post", async (req, res) => {
  res.json(
    await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path: filePath } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = filePath + "." + ext;
    fs.renameSync(filePath, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json("you are not the author");
    }

    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.json(postDoc);
  });
});

app.delete("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id);
  const coverField = postDoc.cover;
  // Check if the 'coverField' exists and is a valid filename
  if (coverField) {
    const pathToDelete = path.join(__dirname, coverField); // Construct the full path to the file

    // Use the 'fs' module to delete the file
    fs.unlink(pathToDelete, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err}`);
      } else {
        console.log(`File ${coverField} deleted successfully.`);
      }
    });
  }
  await postDoc.deleteOne();
  res.json(coverField);
});

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "abdelrahman.ayman8642@gmail.com", // Replace with your actual email address
    pass: "cfxh zode ckxq jawp", // Replace with your actual password or an app-specific password
  },
});

async function sendEmail(mailOptions) {
  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: " + error);
  }
}

function generateUniqueCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const resetCode = generateUniqueCode();

  // Calculate the reset code expiration time (e.g., 1 hour from now)
  const resetCodeExpiration = new Date();
  resetCodeExpiration.setHours(resetCodeExpiration.getHours() + 1);

  // Check if the email exists in the database
  const user = await User.findOne({ email });

  if (user) {
    // Generate a new temporary password
    user.resetCode = resetCode;
    user.resetCodeExpiration = resetCodeExpiration;
    await user.save();

    // Compose the email
    const mailOptions = {
      from: "abdelrahman20191700333@cis.asu.edu.eg", // Replace with your actual email address
      to: email,
      subject: "Password Reset",
      text: `Your reset code is: ${resetCode}. Use this code to reset your password.`,
    };

    // Send the email
    await sendEmail(mailOptions);

    // Provide feedback to the user
    res.send("Password reset email sent");
  } else {
    // Handle the case when the email is not found
    res.send("Email not found");
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  try {
    // Find the user by their email
    const user = await User.findOne({ email });

    if (user) {
      // Check if the reset code matches and is not expired
      if (
        user.resetCode === resetCode &&
        user.resetCodeExpiration > new Date()
      ) {
        // Reset the user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetCode = undefined;
        user.resetCodeExpiration = undefined;

        // Save the updated user document with the new password
        await user.save();

        // Provide feedback to the user
        res.send("Password reset successful");
      } else {
        res.status(400).send("Invalid or expired reset code");
      }
    } else {
      res.status(404).send("Email not found");
    }
  } catch (error) {
    console.error("Error resetting password or updating database: " + error);
    res.status(500).send("An error occurred while resetting the password.");
  }
});

app.listen(4000);
