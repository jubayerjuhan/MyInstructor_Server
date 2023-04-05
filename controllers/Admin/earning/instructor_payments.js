import EarningModel from "../../../models/earnings_model.js";

export const getInstructorPendingPaymentsById = async (instructorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const earnings = await EarningModel.find({
        instructor: instructorId,
        paid: false,
      });
      resolve(earnings);
    } catch (error) {
      reject(error);
    }
  });
};
