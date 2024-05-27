const PaginasController = {
    index: (req, res) => {
        res.render("admin/index", {
            mostrarAdmin: true,
            footerfijo: true
        });
    }
};

module.exports = PaginasController;