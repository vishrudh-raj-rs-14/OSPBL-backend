import expressAsyncHandler from "express-async-handler";
import Invoice from "../models/invoiceModel";
import Voucher from "../models/voucherModel";
import TimeOffice from "../models/timeOfficeModal";
import Product from "../models/productModel";
import Report from "../models/reportModel";
import multer from "multer";
import fs from 'fs'

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  if (file && file.mimetype.startsWith("application/pdf")) {
    cb(null, true);
  } else {
    cb(new Error("Upload only PDF file"), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter as any,
});

const uploadPDF = upload.single('pdfFile');

const processPDF = expressAsyncHandler(async (req: any, res, next) => {
    if (!req.file) return next();
    const pdfFileName = `pdf-${Date.now()}-${req.user._id}.pdf`;
    const savePath = `dist/pdf/${pdfFileName}`;
    console.log(__dirname)
  
  // Save the file
    fs.writeFile(savePath, req.file.buffer, (err) => {
        if (err) {
        console.log(err);
        return next(err);
        }
        req.body.pdfFileName = pdfFileName;
        next();
    })
});

const getGradeCheckData = expressAsyncHandler(async (req, res) => {

    const limit = parseInt(req.query.limit as string) || 30;
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    let voucher: any = await Voucher.find({
        date: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      })
        .sort({ date: -1 })
        .populate("party");

    res.status(200).json({
        status: "success",
        voucher,
        });
    });

const addGradeCheckData = expressAsyncHandler(async (req, res) => {

    const {timeOfficeEntry, pdfFileName} = req.body;
    const weights = JSON.parse(req.body.weights);
    console.log(__dirname)
    console.log(pdfFileName);
    const toRecord = await TimeOffice.findById(timeOfficeEntry);
    const party = toRecord?.party;
    const Items = weights
        const vehicleNumber = toRecord?.vehicleNumber;
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        if (!party || !vehicleNumber || !Items) {
          res.status(400).json({
            status: "fail",
            message: "party, vehicleNumber, Items are required",
          });
          return;
        }

        const itemListTemp = Items.map(async (item: any) => {
            return (await Product.findById(item.materialId))?.code;
        });

        const itemList = await Promise.all(itemListTemp);

        const itemsWithPricePromise = Items.map(async (item: any) => {
            // console.log(item);
          const unitPrice = (await Product.findById(item.materialId))?.price?.find(
            (price: any) => String(price.party) == String(party)
          );
          return {
            ...item,
            unitPrice: unitPrice?.amount,
            netPrice: (unitPrice?.amount as number) * (item.firstWeight-item.secondWeight),
            priceAssigned: unitPrice ? true : false,
          };
        });

        const itemsWithPrice = await Promise.all(itemsWithPricePromise);
        for (let i = 0; i < itemsWithPrice.length; i++) {
          if (!itemsWithPrice[i].priceAssigned) {
            res.status(400).json({
              status: "fail",
              message: "price not assigned for item",
            });
            return;
          }
        }


        const totalPurchase = itemsWithPrice.reduce((acc: number, item: any) => {
          return acc + item.netPrice;
        }, 0);

        await Report.create({
          Items: itemList,
          party: party,
          debit: totalPurchase,
          credit: 0,
          date,
        });
      
        const invoice = await Invoice.create({
          soldBy: party,
          vehicleNumber,
          report: pdfFileName,
          Items: itemsWithPrice.map((item: any) => {
            return { 
                weight: item.firstWeight-item.secondWeight,
                netPrice:item.netPrice,
                unitPrice:item.unitPrice,
                loss:item.loss,
                item: item.materialId,
                remarks: item.remarks
             };
          }),
          totalPurchase,
          balanceAmount: totalPurchase,
        });
        // const modifiedItems = Items.map((item: any) => {
        //   const { unitPrice, netPrice, ...rest } = item;
        //   return rest;
        // });
        
        const voucher = await Voucher.create({
          party: party,
          vehicleNumber,
          report: pdfFileName,
          Items: Items.map((item: any) => {
            return {
                    weight: item.firstWeight-item.secondWeight,
                    loss:item.loss,
                    item: item.materialId,
                    remarks: item.remarks
            };
          }),
        });
        res.status(201).json({
          status: "success",
          // invoice,
          voucher,
        });
      

})

export {getGradeCheckData, addGradeCheckData, uploadPDF, processPDF}