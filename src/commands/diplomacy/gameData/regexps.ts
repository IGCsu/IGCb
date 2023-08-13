const userPattern = /<tr class="member memberAlternate\d"><td class="memberLeftSide">\s+<span class="memberCountryName"> <span class="member\d+StatusIcon">(-|<img src=".+" alt=".+" title=".+" \/>) <\/span><span class="country\d+ {2}memberStatusPlaying">(.+)<\/span><\/span>\s+<\/td>\s+<td class="memberRightSide ">\s+<div>\s+<div class="memberUserDetail">\s+<span class="memberName"><a href=profile\.php\?userID=(\d+)">.+<\/a>\s+<span class="points">\(1000 <img src="images\/icons\/vpoints\.png" alt="D" title="vDiplomacy points" \/><\/b>\)<\/span><\/span> {2}- Delays left: <span class="excusedNMRs">(\d+)<\/span> of <span class="excusedNMRs">(\d+)<\/span>(| - <span class="missedPhases">Missed last deadline<\/span>)?<\/span>\s+<\/div>\s+<div class="memberGameDetail">\s+<span class="memberPointsCount">.+<\/span><br \/><span class="memberUnitCount"><span class="memberSCCount"><em>(\d+)<\/em> supply-centers, <em class=".+">(\d+)<\/em> units<\/span><\/span>/;

export interface GameRegexps {
	[key: string]: RegExp;
}

export const regexps: GameRegexps = {
	/** Блоки игроков */
	users: new RegExp(userPattern, 'g'),

	/** Блок игрока */
	user: new RegExp(userPattern),

	/** Статус игрока */
	status: /<img src=".+" alt="(.+)" title=".+" \/>/,

	/** Дедлайн */
	deadline: /<span class="timestampGames" unixtime="([0-9]+)">/,

	/** Время хода */
	phaseLength: /<span class="gameHoursPerPhase"><strong>([0-9\sa-z]+)<\/strong>/i,

	/** Номер хода */
	turn: /src="map\.php\?gameID=\d+&turn=(\d+|-1)&mapType=large"/,

	/** Информация об игре */
	meta: /<div class="titleBarLeftSide"><div>.+<span class="gameDate">(\w+),\s+(\d+)<\/span>, <span class="gamePhase">(.+)<\/span>/
};

