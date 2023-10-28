// imports
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { User, Post } = require("./models/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
console.log(process.env);

const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET;
const ObjectId = mongoose.Types.ObjectId;
const uploadMiddleware = multer({ dest: "uploads/" });

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_CONNECTION);

User.schema.pre("remove", function (next) {
  const user = this;
  const userId = user._id;

  // Remove the associated posts
  Post.deleteMany({ author: userId }, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
});

app.use("/register", async (req, res) => {
  const {
    username,
    password,
    email,
    firstname,
    lastname,
    address,
    phone,
    title,
  } = req.body;
  try {
    const userDoc = await User.create({
      username,
      email,
      firstname,
      lastname,
      password: bcrypt.hashSync(password, salt),
      address,
      phone,
      title,
    });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  const userDoc = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  });
  if (!userDoc) {
    res.status(404).json({ message: "username or email may be incorect" });
    return;
  }
  const passOk = bcrypt.compareSync(password, userDoc?.password);
  if (passOk) {
    jwt.sign(
      { username: userDoc.username, id: userDoc._id },
      secret,
      {},
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json({
          id: userDoc._id,
          username: userDoc.username,
          firstname: userDoc.firstname,
          lastname: userDoc.lastname,
        });
      }
    );
  } else {
    res.status(404).json({ message: "Password not valid" });
  }
});

app.get("/profile", async (req, res) => {
  const { token } = req.cookies;
  try {
    const decoded = jwt.verify(token, secret, {});
    const user = await User.findOne({ username: decoded.username });
    res.status(200).json(user);
  } catch (err) {
    res.status(403).json(null);
  }
});

app.get("/profile/:id", async (req, res) => {
  const { id } = req.params;
  const { token } = req.cookies;
  try {
    const decoded = jwt.verify(token, secret, {});
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json(null);
  }
});

app.put("/profile/:id", async (req, res) => {
  const { id } = req.params;
  const { token } = req.cookies;
  const {
    title,
    password,
    firstName,
    lastName,
    email,
    phone,
    address,
    changePassword,
    currentPassword,
  } = req.body;
  try {
    const decoded = jwt.verify(token, secret, {});
    console.log(decoded);
    const user = await User.findById(decoded.id);
    console.log(user);
    user.title = title;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phone = phone;
    user.address = address;

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(404).json(null);
  }
});

app.delete("/profile/:id", async (req, res) => {
  const { id } = req.params;
  const { token } = req.cookies;
  try {
    const decoded = jwt.verify(token, secret, {});
    // Find and remove all posts with the user's ID
    const authorObject = new ObjectId(decoded.id);
    const posts = await Post.find({ author: authorObject });

    // Delete the cover images and the posts
    for (const post of posts) {
      // Delete the cover image file from the "uploads" folder
      const coverImageFileName = post.cover;
      try {
        if (coverImageFileName) {
          fs.unlink(path.join(__dirname, coverImageFileName), (err) => {
            if (err) {
              console.error(`Error deleting cover image: ${err}`);
            }
          });
        }
      } catch (err) {
        continue;
      }
    }

    // Remove the post
    await Post.deleteMany({ author: decoded.id });

    // Remove the user
    const user = await User.findByIdAndRemove(decoded.id);
    if (!user) {
      return res.status(404).json(null);
    }

    res
      .status(200)
      .cookie("token", "")
      .json({ message: "User Successefully Removed", user });
  } catch (err) {
    res.status(404).json(null);
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
    if (err) res.status(403).json(err);
    const { title, summary, content, public } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
      public,
    });
    res.json(postDoc);
  });
});

app.get("/post", async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    const posts = await Post.find({
      $or: [{ public: true }],
    })
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json(posts);
    return;
  }

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) res.status(403).json(err);
    const userId = new ObjectId(info.id);
    try {
      const posts = await Post.find({
        $or: [{ public: true }, { author: userId }],
      })
        .populate("author", ["username"])
        .sort({ createdAt: -1 })
        .limit(20);
      res.status(200).json(posts);
    } catch (err) {
      res.status(404).json(err);
    }
  });
});

app.get("/post/:id", async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    res.status(403).json(null);
    return;
  }
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
    const { id, title, summary, content, public } = req.body;
    const postDoc = await Post.findById(id);

    const oldImage = postDoc.cover;
    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
      public,
    });
    if (newPath) {
      const pathToDelete = path.join(__dirname, oldImage);

      // Use the 'fs' module to delete the file
      fs.unlink(pathToDelete, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err}`);
        } else {
          console.log(`File ${oldImage} deleted successfully.`);
        }
      });
    }

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
    user: "abdelrahman.ayman8642@gmail.com",
    pass: process.env.GOOGLE_APPS_PASSWORD,
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

  // Check if the email exists in the database
  const user = await User.findOne({ email });

  if (user) {
    const resetCode = generateUniqueCode();

    // Calculate the reset code expiration time (e.g., 1 hour from now)
    const resetCodeExpiration = new Date();
    resetCodeExpiration.setHours(resetCodeExpiration.getHours() + 1);

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
  const { email, resetCode, password } = req.body;

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
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetCode = undefined;
        user.resetCodeExpiration = undefined;

        // Save the updated user document with the new password
        await user.save();

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
