// middleware/sessionChecker.js
const sessionChecker = (req, res, next) => {
    if (req.session.userId) {
        next(); // Jika sesi valid, lanjutkan ke rute berikutnya
    } else {
        res.status(401).json({ msg: "Session expired. Please log in again." }); // Jika sesi tidak valid, kembalikan respons 401
    }
};

export default sessionChecker;
