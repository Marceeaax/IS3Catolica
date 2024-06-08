const Joi = require("joi");

const integranteStoreSchema = Joi.object({
    username: Joi.string()
});


// const informacionCreacionEjemplo = {
//     username: 15,
// };

// const {error, value } = integranteStoreSchema.validate(
//     informacionCreacionEjemplo,
// );

// console.log("error", error);
// console.log("error", error);