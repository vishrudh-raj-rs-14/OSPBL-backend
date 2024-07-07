"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.get('/', userController_1.protect, (0, userController_1.restricTo)('ADMIN'), userController_1.getAllUsers);
router.delete('/:id', userController_1.protect, (0, userController_1.restricTo)('ADMIN'), userController_1.deleteUser);
router.post('/login', userController_1.login);
router.post('/register', userController_1.protect, (0, userController_1.restricTo)('ADMIN'), userController_1.register);
router.post('/logout', userController_1.logout);
exports.default = router;
