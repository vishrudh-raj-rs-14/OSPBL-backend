"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getAllUsers = exports.restricTo = exports.protect = exports.logout = exports.register = exports.login = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../models/userModel"));
const login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield userModel_1.default.findOne({ email }).select("+password");
    console.log(user, password);
    if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
        res.status(401).json({
            status: "fail",
            message: "Invalid email or password",
        });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
    res
        .status(200)
        .cookie("ospbl", token, {
        httpOnly: true,
        secure: false,
    })
        .json({
        status: "success",
        user,
    });
}));
exports.login = login;
const register = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role, mobileNo } = req.body;
    // if (role == "ADMIN") {
    //   res.status(400).json({
    //     status: "fail",
    //     message: "Cannot register as admin",
    //   });
    // }
    const checkExists = yield userModel_1.default.findOne({ email });
    if (checkExists) {
        console.log(checkExists);
        res.status(400).json({
            status: "fail",
            message: "User already exists",
        });
    }
    const user = yield userModel_1.default.create({ name, role, email, password, mobileNo });
    if (process.env.ENV != "DEV") {
        user.password = "";
    }
    res.status(201).json({
        status: "success",
        user,
    });
}));
exports.register = register;
const logout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res
        .status(200)
        .cookie("ospbl", "", {
        httpOnly: true,
        secure: false,
        expires: new Date(0),
    })
        .json({
        status: "success",
    });
}));
exports.logout = logout;
const protect = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (req.cookies.ospbl) {
        token = req.cookies.ospbl;
    }
    if (!token) {
        res.status(401).json({
            status: "fail",
            message: "Not authorized, no token",
        });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    req.user = yield userModel_1.default.findById(decoded.id).select("-password");
    next();
}));
exports.protect = protect;
const restricTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                status: "fail",
                message: "You do not have permission to perform this action",
            });
        }
        next();
    };
};
exports.restricTo = restricTo;
const getAllUsers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield userModel_1.default.find({});
    res.status(200).json({
        status: "success",
        users,
    });
}));
exports.getAllUsers = getAllUsers;
const deleteUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userCopy = yield userModel_1.default.findById(id);
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
    const user = yield userModel_1.default.findByIdAndDelete(id);
    res.status(200).json({
        status: "success",
        user,
    });
}));
exports.deleteUser = deleteUser;
