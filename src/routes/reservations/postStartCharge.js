const {
  postStartNormalCharge,
  getReservations,
  getPastReservations,
  postStartFastCharge,
} = require("../../queries/reservations");
const { getUserCars } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  const { id } = req.user;
  const { reservationId } = req.params;
  const { userCarId, isFastCharge } = req.query;

  try {
    const hasReservation = await getReservations(db, id);

    if (hasReservation instanceof Error) {
      next(hasReservation);
    }

    if (!hasReservation.rowCount) {
      const error = new Error("No reservations, can't start charge");
      error.code = 400;
      throw error;
    }

    const hasUserCars = await getUserCars(db, id);

    if (hasUserCars instanceof Error) {
      next(hasUserCars);
    }

    if (!hasUserCars.rowCount) {
      const error = new Error("User has no cars, can't start charge");
      error.code = 400;
      throw error;
    }

    const pastReservations = await getPastReservations(db, id);

    if (pastReservations instanceof Error) {
      next(pastReservations);
    }

    const isPastReservation = pastReservations.rows.filter(
      (row) => row.id === Number(reservationId)
    );

    if (isPastReservation.length) {
      const error = new Error("Past reservation, can't start charge");
      error.code = 400;
      throw error;
    }

    const result =
      isFastCharge === "1"
        ? await postStartFastCharge(db, id, userCarId, reservationId)
        : await postStartNormalCharge(db, id, userCarId, reservationId);

    if (result instanceof Error) {
      next(result);
    }

    if (!result.rowCount) {
      const error = new Error("Charge still in place");
      error.code = 400;
      throw error;
    }

    const { rows, rowCount } = result;

    res.status(200).json({
      success: true,
      count: rowCount,
      data: rows,
    });
  } catch (error) {
    next(error);
    console.info("> something went wrong: ", error.message);
  }
};
