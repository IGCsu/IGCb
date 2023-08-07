const INITIAL_WIDTH = 350;
const SCALE = 2.0;
const WIDTH = INITIAL_WIDTH * SCALE;

const RESOLUTION = {
	CARD_WIDTH: WIDTH,
	CARD_HEIGHT: Math.round(WIDTH * 1.6)
}

const ALIGNMENT = {
	TOP_LEFT:       [0,     0],
	TOP_CENTER:     [0,   0.5],
	TOP_RIGHT:      [0,     1],
	CENTER_LEFT:    [0.5,   0],
	CENTER_CENTER:  [0.5, 0.5],
	CENTER_RIGHT:   [0.5,   1],
	BOTTOM_LEFT:    [1,     0],
	BOTTOM_CENTER:  [1,   0.5],
	BOTTOM_RIGHT:   [1,     1]
}

const STYLE = {
	AVATAR_SHIFT: RESOLUTION.CARD_WIDTH / 3.5,
	AVATAR_SIZE: RESOLUTION.CARD_WIDTH / 3.5,
	AVATAR_BG_BORDER: 5 * SCALE,
	DARK_BACKGROUND_SHIFT: RESOLUTION.CARD_WIDTH / 35,
	DARK_BACKGROUND_INNER_SHIFT: RESOLUTION.CARD_WIDTH / 29.1666,
	ROUNDING: RESOLUTION.CARD_WIDTH / 21.875,
	BORDER_SIZE: 15 * SCALE,
	ROLE_LIMIT_FONT_SIZE: 22.5 * 0.7 * SCALE,
	PROGRESSBAR_HEIGHT: RESOLUTION.CARD_WIDTH / 31.67 * 1.6,
	PROGRESSBAR_WIDTH: RESOLUTION.CARD_WIDTH - ((15 * SCALE) * 2 + (12 * SCALE) * 2),
	PROGRESSBAR_ROUNDING: (RESOLUTION.CARD_WIDTH / 21.875) / 4,
	PROGRESSBAR_SHIFT: RESOLUTION.CARD_WIDTH / 31.67 * 5,
	PROGRESSBAR_SHIFT_UP: RESOLUTION.CARD_WIDTH / 29.1666,
	PROGRESSBAR_SHIFT_DOWN: RESOLUTION.CARD_WIDTH / 58.3333,
	MAX_LEVEL_ICON_SIDE_LENGTH: RESOLUTION.CARD_WIDTH / 20,
	USERNAME_MAX_WIDTH: (RESOLUTION.CARD_WIDTH - ((RESOLUTION.CARD_WIDTH / 23.3333) * 4)) * 0.7,
	USERNAME_MAX_FONT_SIZE: 22.5 * SCALE,
	STATS_GRID_SHIFT: 18 * SCALE,
	STATS_GRID_GAP: 10 * SCALE,
	LABEL_ROLE_FONT_SIZE: 15.5 * SCALE,
    LABEL_STATS_PRIMARY_FONT_SIZE: (15.5 * SCALE) - 4,
    LABEL_STATS_SECONDARY_FONT_SIZE: (15.5 * SCALE) - 8,
}

const COLOURS = {
	BLACK: '#18191c',
	DARK_GRAY: '#2b2d31',
	GRAY: '#68696c',
	RED: '#ff3737',
	WHITE: '#ffffff'

}

module.exports = {
	INITIAL_WIDTH,
	SCALE,
	WIDTH,
	RESOLUTION,
	ALIGNMENT,
	STYLE,
	COLOURS
}