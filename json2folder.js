var users = {};


(function main () {
	var dirname = users[target].first_name + '_' + users[target].last_name;
	prepare(dirname);
	save(dirname + '/chats', chats);
	save(dirname + '/dialogs', dialogs);
})();


/**
 * Подготовка места сохранения
 */
function prepare (workdir) {
	if (fs.existsSync(workdir)) {
		console.log('Папка существует. Конфликтующие файлы будут перезаписаны');
	} else {
		fs.mkdirSync(workdir);
		fs.mkdirSync(workdir+'/chats');
		fs.mkdirSync(workdir+'/dialogs');
	}
}

/**
 * Сохраняет логи сообщений
 */
function save (dir, files) {
	for (var name in files) {
		if (files.hasOwnProperty(name)) {
			fs.writeFileSync(dir+'/'+name, files[name].join('\n'))
		}
	}
} 

/**
 * Получение имен пользователей
 */
function loadNames(callback, names) {
	var toload = uniq(names).filter(function(id){return !users[id]});
	
	if (!toload.length) {
		return callback();
	}

	api(function (ns) {
		ns.forEach(function(user){
			users[user.id] = user;
		});
		callback();
	}, 'users.get', {user_ids: toload.join(',')});
}



/**
 * Вспомогательные функции
 */


// Удаляет дубликаты из массива
function uniq(a) {
	var seen = {};
	return a.filter(function(item) {
		return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	});
}

// Добавляет нули, чтобы строка получилась фиксированной длинны
Number.prototype.padLeft = function(base,chr){
	var len = (String(base || 10).length - String(this).length)+1;
	return len > 0? new Array(len).join(chr || '0')+this : this;
}

// Возвращает время в формате dd:mm:yy hh:mm:ss
function todate(unix) {
	var d = new Date(unix*1000);
	return [d.getDate().padLeft(), (d.getMonth()+1).padLeft(),d.getFullYear()].join('.') + ' ' + [ d.getHours().padLeft(), d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(':');
}

// Наилучшее качество изображения из доступных
function maxresolution (att) {
	return att.photo.photo_2560 || att.photo.photo_1280 || att.photo.photo_807 || att.photo.photo_604 || att.photo.photo_130 || att.photo.photo_75
}

// Грязный, но надежный способ клонировать объект
function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}