const express = require('express'); 
const router = express.Router();

router.get("/", (req, res) => {
    res.render("admin/index",{
        mostrarAdmin: true,
        footerfijo: true
    });
});

module.exports = router;