// backend/src/modules/menu/menu.controller.js
const { getMenuForUser } = require('./menu.service');

const getMenu = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        const menu = getMenuForUser(user);

        res.json({
            success: true,
            data: menu,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMenu,
};
