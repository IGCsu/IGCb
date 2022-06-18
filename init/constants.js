/**
 * Определяет константы бота
 */
module.exports = () => {
    global.constants = {

        /**
         * ID сообщества, в котором бот будет работать
         */
        HOME: '433242520034738186',

        /**
         * Значение для allowedMentions: отключение любых упоминаний
         */
        AM_NONE: { parse: [] },

        SITE_LINK: 'https://igc.su',

    };
}