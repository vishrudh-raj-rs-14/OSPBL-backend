import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel";

const login = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({
      status: "fail",
      message: "Invalid email or password",
    });
    return;
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });

  res
    .status(200)
    .cookie("ospbl", token, {
      httpOnly: true,
      sameSite: 'strict',
    })
    .json({
      status: "success",
      user,
    });
});

const register = expressAsyncHandler(async (req, res) => {
  const { name, email, password, role, mobileNo } = req.body;

  // if (role == "ADMIN") {
  //   res.status(400).json({
  //     status: "fail",
  //     message: "Cannot register as admin",
  //   });
  // }
  const checkExists = await User.findOne({ email });
  if (checkExists) {
    console.log(checkExists);
    res.status(400).json({
      status: "fail",
      message: "User already exists",
    });
  }
  const user = await User.create({ name, role, email, password, mobileNo });
  if (process.env.ENV != "DEV") {
    user.password = "";
  }

  res.status(201).json({
    status: "success",
    user,
  });
});

const logout = expressAsyncHandler(async (req, res) => {
  res
    .status(200)
    .cookie("ospbl", "", {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(0),
    })
    .json({
      status: "success",
    });
});

const protect = expressAsyncHandler(async (req: any, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (req.cookies.ospbl) {
    token = req.cookies.ospbl;
  }
  console.log("-------------------")
  console.log(JSON.stringify(req.cookies), process.env.JWT_SECRET )
  console.log("-------------------")

  if (!token) {
    res.status(401).json({
      status: "fail",
      message: "Not authorized, no token",
    });
  }
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
  req.user = await User.findById(decoded.id).select("-password");
  next();
});

const restricTo = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

const getAllUsers = expressAsyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json({
    status: "success",
    users,
  });
});

const deleteUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const userCopy = await User.findById(id);
  if (!userCopy) {
    res.status(404).json({
      status: "fail",
      message: "User not found",
    });
    return;
  }
  if (userCopy.role == "ADMIN") {
    res.status(400).json({
      status: "fail",
      message: "Cannot delete admin",
    });
    return;
  }
  const user = await User.findByIdAndDelete(id);
  res.status(200).json({
    status: "success",
    user,
  });
});

export { login, register, logout, protect, restricTo, getAllUsers, deleteUser };
