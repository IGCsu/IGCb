## About

### warn
Модуль создания и отслеживания варнов, мутов и банов.

## Структура модуля:
- `./about.json` - Информация о модуле
- `./bitFields.json` - Набор констант для побитовых вычислений
- `./slashOptions.json` - Объект для формирования слеш-команд
- `./EmbedBuilder.js` - [Класс-конструктор Эмбедов](#EmbedBuilder)
- `./ModalBuilder.js` - [Класс-конструктор Модалок](#ModalBuilder)
- `./Warn.js` - [ORM-класс. Модель для связи с таблицей варнов в базе данных](#Warn)
- `./WarnPagination.js` - [Класс пагинации для `Warn.js`](#WarnPagination)
- `./index.js` - входной файл

<h3 name="EmbedBuilder">EmbedBuilder</h3>
Класс-конструктор Эмбедов.\
Класс представляет собой набор статичных методов для формирования эмбедов.
Каждый публичный метод класса возвращает объект подобный `Discord.InteractionReplyOptions`, который можно использовать в `interaction.reply()`.
- `noPermissions()` - Эмбед отсутствия прав
- `noSuchWarn()` - Эмбед отсутствия варна
- `noWarns()` - Эмбед отсутствия варнов у пользователя
- `newWarn()` - Эмбед созданного варна
- `editWarn()` - Эмбед отредактированного варна
- `removeWarn()` - Эмбед удалённого варна
- `showWarn()` - Эмбед варна
- `paginationWarns()` - Эмбед постраничного списка варнов

<h3 name="ModalBuilder">ModalBuilder</h3>
Класс-конструктор Модалок.\
Класс представляет собой набор статичных методов для формирования модалок.
Каждый публичный метод класса возвращает объект подобный `Discord.Modal`, который можно использовать в `interaction.showModal()`.
- `newWarn()` - Модалка нового варна
- `editWarn()` - Модалка изменения причины Варна

<h3 name="Warn">Warn</h3>
ORM-класс. Модель для связи с таблицей варнов в базе данных.\
Класс представляет собой ORM-модель, то есть является конструктором экземпляра варна, а так же имеет несколько статичных методов для взаимодействия с базой данных.

##### Статичные методы:
- `get()` - Возвращает варн по ID
- `last()` - Возвращает последний варн
- `all()` - Возвращает все варны
- `pagination()` - Возвращает пагинацию варнов, экземпляр класса `WarnPagination`
- `create()` - Создаёт варн
##### Экземпляр класса:
- `id` - ID варна
- `type` - Тип варна, используется `bitFields.types`
- `targetId` - ID участника получившего варн
- `getTarget()` - Возвращает пользователя получивший варн
- `authorId` - ID автор варна
- `getAuthor` - Возвращает автора варна
- `#date` - Unixtime метка выдачи варна
- `date` - Временная метка выдачи варна
- `#flagsRaw` - Флаги в формате для хранения в БД
- `flagsRaw` - Объект содержащий пары ключ + bool значение
- `reason` - Причина варна
- `save()` - Сохраняет модель в базу данных
- `toString()` - Возвращает строку варна
- `getEmbed()` - Возвращает эмбед варна. Используется `EmbedBuilder.showWarn()`
##### Пример использования:
Получение экземпляра варна:
```js
const warnById = Warn.get(1);
const lastWarnUser = Warn.last(256114365894230018);
const allWarnsUser = Warn.all(256114365894230018);
```
Создание варна (Оба варианта идентичны):
```js
const warn = new Warn({
	target: target,
	reason: reason,
	author: author
});
warn.save();
```
```js
const warn = Warn.create({
	target: target,
	reason: reason,
	author: author
});
```
Редактирование варна:
```js
const warn = Warn.get(1);
warn.reason = 'new reason';
warn.flags = newFlags;
warn.save();
```
Получение сформированной информации о варнах:
```js
let text = '';

const warns = Warn.all();
for(const warn of warns){
	text += '- ' + warn + '\n';
}

channel.send(text);
```
```js
const warn = Warn.get(1);
const msg = warn.getEmbed();
channel.send(msg);
```

<h3 name="WarnPagination">WarnPagination</h3>
Класс пагинации для `Warn.js`.\
Вспомогательный класс-метод пагинации для класса `Warn`. Используется в `Warn.pagination()`, не предусмотрено использование отдельно.
##### Экземпляр класса:
- `target` - Пользователь, цель поиска
- `count` - Всего варнов
- `pageLast` - Максимальное кол-во страниц
- `pageNumber` - Текущая страница
- `pageCount` - Кол-во записей на одной странице
- `list` - Список варнов, содержит экземпляры Warn
- `getEmbed()` - Возвращает эмбед списка варнов варна. Используется `EmbedBuilder.paginationWarns()`
##### Пример использования:
Получение экземпляра пагинации:
```js
const pagination = Warn.pagination(user);
const pagination2page = Warn.pagination(user, 2);
const pagination20rowsInOnePage = Warn.pagination(user, 1, 20);
```
Получение эмбеда для постраничного списка:
```js
const pagination = Warn.pagination(user);
const msg = await pagination.getEmbed(int);
int.reply(msg);
```

## Dependencies
- `global.client`
