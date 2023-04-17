import { FortnightlyPaymentModel } from "../../../models/fortnightly_payment_model.js";

export const addFortnightlyPayment = async (
  invoice,
  instructorId,
  earnings,
  breakdown
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fortnightPayment = await FortnightlyPaymentModel.create({
        ...breakdown,
        invoice,
        instructor: instructorId,
      });
      resolve(fortnightPayment);
    } catch (error) {
      reject(error.message);
    }
  });
};
