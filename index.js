const express = require("express");
const path = require("path");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./models/user");
const BlogPost = require("./models/blogpost");

mongoose.connect(
  "mongodb+srv://harsh59266:ea0YTb2sO0248v2r@cluster0.duxnli5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.use(
  session({
    secret: "your_secret_key_here",
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const authenticateDriver = async (req, res, next) => {
  try {
    if (
      req.session &&
      req.session.user &&
      req.session.user.userType === "Driver"
    ) {
      const user = await User.findById(req.session.user._id);
      if (user) {
        req.user = user;
        next();
      } else {
        res.redirect("/login");
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).send("Internal Server Error");
  }
};

app.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

app.get("/login", (req, res) => {
  res.render("login", { user: req.session.user });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ username: email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send("Invalid email or password");
    }
    req.session.user = { _id: user._id, userType: user.userType };
    res.redirect("/");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup", { user: req.session.user });
});

app.post("/signup", async (req, res) => {
  const { username, password, repeatPassword } = req.body;
  if (password !== repeatPassword) {
    return res.status(400).send("Passwords do not match");
  }
  try {
    const newUser = new User({
      username,
      password,
      userType: "Driver",
      firstName: "default",
      lastName: "default",
      licenseNumber: "default",
      age: 0,
      carDetails: {
        make: "default",
        model: "default",
        year: 0,
        plateNumber: "default",
      },
    });
    await newUser.save();
    res.redirect("/login");
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to logout");
    }
    res.redirect("/login");
  });
});

app.get("/g", authenticateDriver, (req, res) => {
  res.render("g", { user: req.user });
});

app.get("/g2", authenticateDriver, (req, res) => {
  res.render("g2", { user: req.user });
});

app.post("/submit", authenticateDriver, async (req, res) => {
  const {
    firstName,
    lastName,
    licenseNumber,
    age,
    make,
    model,
    year,
    plateNumber,
  } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        licenseNumber,
        age,
        "carDetails.make": make,
        "carDetails.model": model,
        "carDetails.year": year,
        "carDetails.plateNumber": plateNumber,
      },
      { new: true }
    );
    res.redirect("/g2");
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/updateUser", authenticateDriver, async (req, res) => {
  const { make, model, year, plateNumber } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        "carDetails.make": make,
        "carDetails.model": model,
        "carDetails.year": year,
        "carDetails.plateNumber": plateNumber,
      },
      { new: true }
    );
    res.render("g", { user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(4002, () => {
  console.log("App listening on port 4002");
});







// //const express = require("express");
// const path = require("path");
// const app = express();
// const ejs = require("ejs");
// const bodyParser = require("body-parser");
// const bcrypt = require("bcrypt");
// const session = require("express-session");
// const mongoose = require("mongoose");
// const User = require("./models/user");
// const Appointment = require("./models/Appointment");

// // Connect to MongoDB
// mongoose.connect(
//   "mongodb+srv://harsh59266:ea0YTb2sO0248v2r@cluster0.duxnli5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// ).then(() => {
//   console.log("Connected to MongoDB");
// }).catch((error) => {
//   console.error("MongoDB connection error:", error);
// });

// // Middleware setup
// app.use(
//   session({
//     secret: "your_secret_key_here",
//     resave: false,
//     saveUninitialized: false,
//   })
// );
// app.set("view engine", "ejs");
// app.use(express.static("public"));
// app.use(bodyParser.urlencoded({ extended: true }));

// // Middleware to authenticate driver
// const authenticateDriver = async (req, res, next) => {
//   try {
//     if (req.session && req.session.user && req.session.user.userType === "Driver") {
//       const user = await User.findById(req.session.user._id);
//       if (user) {
//         req.user = user;
//         next();
//       } else {
//         res.redirect("/login");
//       }
//     } else {
//       res.redirect("/login");
//     }
//   } catch (error) {
//     res.status(500).send("Internal Server Error");
//   }
// };

// const authenticateAdmin = async (req, res, next) => {
//   try {
//     if (req.session && req.session.user && req.session.user.userType === "Admin") {
//       const user = await User.findById(req.session.user._id);
//       if (user) {
//         req.user = user;
//         next();
//       } else {
//         res.redirect("/login");
//       }
//     } else {
//       res.redirect("/login");
//     }
//   } catch (error) {
//     res.status(500).send("Internal Server Error");
//   }
// };

// // Define time slots
// const timeSlots = [
//   "9:00 AM",
//   "9:30 AM",
//   "10:00 AM",
//   "10:30 AM",
//   "11:00 AM",
//   "11:30 AM",
//   "12:00 PM",
//   "12:30 PM",
//   "1:00 PM",
//   "1:30 PM",
//   "2:00 PM",
// ];

// // Routes

// // Home page
// app.get("/", (req, res) => {
//   res.render("index", { user: req.session.user });
// });
// // Signup page
// app.get("/signup", (req, res) => {
//   res.render("signup", { user: req.session.user });
// });

// app.post("/signup", async (req, res) => {
//   const { username, password, repeatPassword ,userType } = req.body;
//   if (password !== repeatPassword) {
//     return res.status(400).send("Passwords do not match");
//   }
//   try {
//     const newUser = new User({
//       username,
//       password,
//       userType,
//       firstName: "default",
//       lastName: "default",
//       licenseNumber: "default",
//       age: 0,
//       carDetails: {
//         make: "default",
//         model: "default",
//         year: 0,
//         plateNumber: "default",
//       },
//     });
//     await newUser.save();
//     res.redirect("/login");
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });
// // Login page
// app.get("/login", (req, res) => {
//   res.render("login", { user: req.session.user });
// });

// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     console.log("Login attempt:", { username, password });

//     const user = await User.findOne({ username });
//     if (!user) {
//       console.log("User not found:", username);
//       return res.status(400).send("Invalid username or password");
//     }

//     console.log("User found:", user);

//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log("Password match result:", isMatch);

//     if (!isMatch) {
//       return res.status(400).send("Invalid username or password");
//     }

//     req.session.user = { _id: user._id, userType: user.userType };
//     console.log("User authenticated successfully:", req.session.user);

//     res.redirect("/");
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });


// // Logout route
// app.get("/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).send("Failed to logout");
//     }
//     res.redirect("/login");
//   });
// });

// // Driver-specific routes
// app.get("/g", authenticateDriver, (req, res) => {
//   res.render("g", { user: req.user });
// });

// // Render the G2 page with available time slots
// app.get("/g2", authenticateDriver, async (req, res) => {
//   try {
//     const currentDate = new Date();
//     const formattedDate = `${currentDate.getFullYear()}-${(
//       currentDate.getMonth() + 1
//     )
//       .toString()
//       .padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
//     const appointments = await Appointment.find({
//       date: formattedDate,
//       isTimeSlotAvailable: true,
//     }).distinct("time");
//     res.render("g2", { user: req.user, date: formattedDate, appointments });
//   } catch (error) {
//     console.error("Error rendering G2 page:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // Update driver profile
// app.post("/submit", authenticateDriver, async (req, res) => {
//   const {
//     firstName,
//     lastName,
//     licenseNumber,
//     age,
//     make,
//     model,
//     year,
//     plateNumber,
//   } = req.body;
//   try {
//     await User.findByIdAndUpdate(
//       req.user._id,
//       {
//         firstName,
//         lastName,
//         licenseNumber,
//         age,
//         "carDetails.make": make,
//         "carDetails.model": model,
//         "carDetails.year": year,
//         "carDetails.plateNumber": plateNumber,
//       },
//       { new: true }
//     );
//     res.redirect("/g2");
//   } catch (error) {
//     res.status(500).send("Internal Server Error");
//   }
// });

// // Update car details
// app.post("/updateUser", authenticateDriver, async (req, res) => {
//   const { make, model, year, plateNumber } = req.body;
//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       req.user._id,
//       {
//         "carDetails.make": make,
//         "carDetails.model": model,
//         "carDetails.year": year,
//         "carDetails.plateNumber": plateNumber,
//       },
//       { new: true }
//     );
//     res.render("g", { user: updatedUser });
//   } catch (error) {
//     res.status(500).send("Internal Server Error");
//   }
// });

// // Admin routes

// // Render the appointment page
// app.get("/appointment", authenticateAdmin, async (req, res) => {
//   try {
//     const currentDate = new Date();
//     const formattedDate = `${currentDate.getFullYear()}-${(
//       currentDate.getMonth() + 1
//     )
//       .toString()
//       .padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
//     const timeSlots = await Appointment.find({ date: formattedDate }).distinct(
//       "time"
//     );
//     res.render("appointment", {
//       timeSlots,
//       user: req.user,
//       date: formattedDate,
//     });
//   } catch (error) {
//     res.status(500).send("Internal Server Error");
//   }
// });

// // Create appointment slot
// app.post("/createAppointment", authenticateAdmin, async (req, res) => {
//   const { date, time } = req.body;

//   try {
//     const selectedDate = new Date(date);
//     const currentDate = new Date();

//     if (selectedDate < currentDate) {
//       return res.status(400).send("Cannot create appointment for past dates.");
//     }

//     if (!date || !time) {
//       return res.status(400).send("Date and time are required.");
//     }

//     const existingAppointment = await Appointment.findOne({ date, time });

//     if (existingAppointment) {
//       return res
//         .status(400)
//         .send("Appointment slot already exists for this date and time.");
//     }

//     const newAppointment = new Appointment({
//       date,
//       time,
//       isTimeSlotAvailable: true,
//     });
//     await newAppointment.save();

//     res.redirect("/appointment");
//   } catch (error) {
//     console.error("Error creating appointment slot:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // Book an appointment slot
// app.post("/bookAppointment", authenticateDriver, async (req, res) => {
//   const { date, time } = req.body;

//   try {
//     const appointment = await Appointment.findOne({
//       date,
//       time,
//       isTimeSlotAvailable: true,
//     });

//     if (!appointment) {
//       return res.status(400).send("The selected slot is not available.");
//     }

//     appointment.isTimeSlotAvailable = false;
//     appointment.bookedBy = req.user._id;
//     await appointment.save();

//     // Update the user's appointment
//     await User.findByIdAndUpdate(req.user._id, {
//       $set: { appointment: appointment._id },
//     });

//     res.redirect("/g2");
//   } catch (error) {
//     console.error("Error booking appointment slot:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // Fetch existing appointments for a given date
// app.get("/getAppointments", authenticateAdmin, async (req, res) => {
//   const { date } = req.query;
//   try {
//     if (!date) {
//       return res.status(400).send("Date is required.");
//     }

//     const appointments = await Appointment.find({ date });
//     res.json(appointments);
//   } catch (error) {
//     console.error("Error fetching appointments:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// // Starting the server
// const PORT = process.env.PORT || 4001;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
