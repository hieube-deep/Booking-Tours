export const validateRequest = (schema, targer = "body") => {
    return (req, res, next) => {
        const error = schema.validate(req[targer]);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    }
}