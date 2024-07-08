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
exports.deleteParty = exports.updateParty = exports.createParty = exports.getPartybyId = exports.getAllParties = void 0;
const partyModel_1 = __importDefault(require("../models/partyModel"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const getAllParties = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { partyName, gstNo, mobileNo } = req.query;
    const filter = {};
    if (partyName) {
        filter.partyName = { $regex: partyName, $options: 'i' };
    }
    if (gstNo) {
        filter.gstNo = { $regex: gstNo, $options: 'i' };
    }
    if (mobileNo) {
        filter.mobileNo = { $regex: mobileNo, $options: 'i' };
    }
    const parties = yield partyModel_1.default.find(Object.assign(Object.assign({}, filter), { deletedParty: false }));
    res.status(200).json({
        status: 'success',
        parties,
    });
}));
exports.getAllParties = getAllParties;
const getPartybyId = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        res.status(400).json({
            status: 'fail',
            message: 'Party id not provided',
        });
        return;
    }
    const party = yield partyModel_1.default.findById(req.params.id);
    if (!party) {
        res.status(404).json({
            status: 'fail',
            message: 'Party not found',
        });
        return;
    }
    res.status(200).json({
        status: 'success',
        party,
    });
}));
exports.getPartybyId = getPartybyId;
const createParty = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { partyName, gstNo, mobileNo, address, bankDetails } = req.body;
    const party = yield partyModel_1.default.create({
        partyName,
        gstNo,
        mobileNo,
        address,
        bankDetails,
    });
    res.status(201).json({
        status: 'success',
        party,
    });
}));
exports.createParty = createParty;
const updateParty = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        res.status(400).json({
            status: 'fail',
            message: 'Party id not provided',
        });
        return;
    }
    const { partyName, gstNo, mobileNo, address, bankDetails } = req.body;
    const party = yield partyModel_1.default.findByIdAndUpdate(req.params.id, { partyName, gstNo, mobileNo, address, bankDetails }, { new: true, runValidators: true });
    res.status(200).json({
        status: 'success',
        party,
    });
}));
exports.updateParty = updateParty;
const deleteParty = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        res.status(400).json({
            status: 'fail',
            message: 'Party id not provided',
        });
        return;
    }
    // const products = await Product.find({
    //   price: { $elemMatch: { party: req.params.id } },
    // });
    // const updatedProducts = products.map(async (product) => {
    //   await Product.findByIdAndUpdate(
    //     product._id,
    //     { $pull: { price: { party: req.params.id } } },
    //     { new: true, runValidators: true }
    //   );
    // });
    // await Promise.all(updatedProducts);
    // await TimeOffice.deleteMany({ party: req.params.id });
    const party = yield partyModel_1.default.findByIdAndUpdate(req.params.id, { removedParty: true }, { new: true, runValidators: true });
    res.status(200).json({
        status: 'success',
        party,
    });
}));
exports.deleteParty = deleteParty;
