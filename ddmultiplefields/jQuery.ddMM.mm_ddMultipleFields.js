/**
 * jQuery.ddMM.mm_ddMultipleFields
 * @version 2.1.1 (2016-11-17)
 * 
 * @uses jQuery 1.9.1
 * @uses jQuery.ddTools 1.8.1
 * @uses jQuery.ddMM 1.1.2
 * 
 * @copyright 2013–2014 [DivanDesign]{@link http://www.DivanDesign.biz }
 */

(function($){
$.ddMM.mm_ddMultipleFields = {
	defaults: {
		//Разделитель строк
		rowDelimiter: '||',
		//Разделитель колонок
		colDelimiter: '::',
		//Колонки
		columns: 'field',
		//Заголовки колонок
		columnsTitles: '',
		//Данные колонок
		columnsData: '',
		//Ширины колонок
		columnsWidth: '180',
		//Стиль превьюшек
		previewStyle: '',
		//Минимальное количество строк
		minRowsNumber: 0,
		//Максимальное количество строк
		maxRowsNumber: 0
	},
	/**
	 * @prop instances {object_plain} — All instances.
	 * @prop instances[item] {object_plain} — Item, when key — TV id.
	 * @prop instances[item].id {string} — Unique TV id (similar to key).
	 * @prop instances[item].rowDelimiter {string} — Разделитель строк.
	 * @prop instances[item].colDelimiter {string} — Разделитель колонок.
	 * @prop instances[item].columns {array} — Колонки. Default: 'field'.
	 * @prop instances[item].columnsTitles {array} — Заголовки колонок.
	 * @prop instances[item].columnsData {array} — Данные колонок.
	 * @prop instances[item].columnsWidth {array} — Ширины колонок.
	 * @prop instances[item].previewStyle {string} — Стиль превьюшек.
	 * @prop instances[item].minRowsNumber {integer} — Минимальное количество строк.
	 * @prop instances[item].maxRowsNumber {integer} — Максимальное количество строк.
	 * @prop instances[item].$parent {jQuery} — TV field DOM parent.
	 * @prop instances[item].$originalField {jQuery} — TV field.
	 * @prop instances[item].$table {jQuery} — Multiple field table.
	 * @prop instances[item].$addButton {jQuery} — New row adding button.
	 * @prop instances[item].$currentField {jQuery} — Current field from table.
	 */
	instances: {},
	richtextWindow: null,
	
	/**
	 * @method updateField
	 * @version 2.0.1 (2016-11-17)
	 * 
	 * @desc Обновляет мульти-поле, берёт значение из оригинального поля.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.id {string} — TV id.
	 * 
	 * @returns {void}
	 */
	updateField: function(params){
		var _this = this;
		
		//Если есть текущее поле
		if (_this.instances[params.id].$currentField){
			//Задаём значение текущему полю (берём у оригинального поля), запускаем событие изменения
			_this.instances[params.id].$currentField.val($.trim(_this.instances[params.id].$originalField.val())).trigger('change.ddEvents');
			//Забываем текущее поле (ибо уже обработали)
			_this.instances[params.id].$currentField = false;
		}
	},
	
	/**
	 * @method updateTv
	 * @version 2.0.1 (2016-11-17)
	 * 
	 * @desc Обновляет оригинальное поле TV, собирая данные по мульти-полям.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.id {string} — TV id.
	 * 
	 * @returns {void}
	 */
	updateTv: function(params){
		var _this = this,
			masRows = new Array();
		
		//Перебираем все строки
		_this.instances[params.id].$table.find('.ddFieldBlock').each(function(){
			var $this = $(this),
				masCol = new Array(),
				id_field = {
					index: false,
					val: false,
					$field: false
				};
			
			//Перебираем все колонки, закидываем значения в массив
			$this.find('.ddField').each(function(index){
				//Если поле с типом id TODO: Какой смысл по всех этих манипуляциях?
				if (_this.instances[params.id].columns[index] == 'id'){
					id_field.index = index;
					id_field.$field = $(this);
					
					//Сохраняем значение поля
					id_field.val = id_field.$field.val();
					//Если значение пустое, то генерим
					if (id_field.val == ''){id_field.val = (new Date).getTime();}
					
					//Обнуляем значение
					id_field.$field.val('');
				}
				
				//Если колонка типа richtext
				if (_this.instances[params.id].columns[index] == 'richtext'){
					//Собираем значения строки в массив
					masCol.push($.trim($(this).html()));
				}else{
					//Собираем значения строки в массив
					masCol.push($.trim($(this).val()));
				}
			});
			
			//Склеиваем значения колонок через разделитель
			var col = masCol.join(_this.instances[params.id].colDelimiter);
			
			//Если значение было хоть в одной колонке из всех в этой строке
			if (col.length != ((masCol.length - 1) * _this.instances[params.id].colDelimiter.length)){
				//Проверяем было ли поле с id
				if (id_field.index !== false){
					//Записываем значение в поле
					id_field.$field.val(id_field.val);
					//Обновляем значение в массиве
					masCol[id_field.index] = id_field.val;
					//Пересобираем строку
					col = masCol.join(_this.instances[params.id].colDelimiter);
				}
				
				masRows.push(col);
			}
		});
		
		//Записываем значение в оригинальное поле
		_this.instances[params.id].$originalField.val(masRows.join(_this.instances[params.id].rowDelimiter));
	},
	
	/**
	 * @method init
	 * @version 3.0 (2016-11-17)
	 * 
	 * @desc Инициализация.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.id {string} — TV id.
	 * @param params.value {string} — TV value.
	 * @param params.$parent {jQuery} — TV parent.
	 * @param params.$originalField {jQuery} — TV.
	 * @param params.rowDelimiter {string} — Разделитель строк.
	 * @param params.colDelimiter {string} — Разделитель колонок.
	 * @param params.columns {string_commaSeparated|array} — Колонки.
	 * @param params.columnsTitles {string_commaSeparated|array} — Заголовки колонок.
	 * @param params.columnsData {separated string|array} — Данные колонок.
	 * @param params.columnsWidth {string_commaSeparated} — Ширины колонок.
	 * @param params.previewStyle {string} — Стиль превьюшек.
	 * @param params.minRowsNumber {integer} — Минимальное количество строк.
	 * @param params.maxRowsNumber {integer} — Максимальное количество строк.
	 * 
	 * @returns {void}
	 */
	init: function(instance){
		var _this = this;
		
		//Разбиваем значение по строкам
		var value = instance.value.split(instance.rowDelimiter);
		//Это поле нужно было только для инициализации
		delete instance.value;
		
		//Сохраняем экземпляр текущего объекта с правилами
		_this.instances[instance.id] = instance;
		
		//Делаем таблицу мульти-поля
		instance.$table = $('<table class="ddMultipleField" id="' + instance.id + 'ddMultipleField"></table>').appendTo(instance.$parent);
		
		//Если есть хоть один заголовок
		if (instance.columnsTitles.length > 0){
			var text = '';
			
			//Создадим шапку (перебираем именно колонки!)
			$.each(instance.columns, function(key, val){
				//Если это колонка с id
				if (val == 'id'){
					//Вставим пустое значение в массив с заголовками
					instance.columnsTitles.splice(key, 0, '');
					
					text += '<th style="display: none;"></th>';
				}else{
					//Если такого значения нет — сделаем
					if (!instance.columnsTitles[key]){
						instance.columnsTitles[key] = '';
					}
					
					text += '<th>' + (instance.columnsTitles[key]) + '</th>';
				}
			});
			
			$('<tr><th></th>' + text + '<th></th></tr>').appendTo(instance.$table);
		}
		
		//Проверяем на максимальное и минимальное количество строк
		if (
			instance.maxRowsNumber &&
			value.length > instance.maxRowsNumber
		){
			value.length = instance.maxRowsNumber;
		}else if (
			instance.minRowsNumber &&
			value.length < instance.minRowsNumber
		){
			value.length = instance.minRowsNumber;
		}
		
		//Создаём кнопку +
		instance.$addButton = _this.makeAddButton({id: instance.id});
		
		for (
			var i = 0, len = value.length;
			i < len;
			i++
		){
			//В случае, если размер массива был увеличен по minRowsNumber, значением будет undefined, посему зафигачим пустую строку
			_this.makeFieldRow({
				id: instance.id,
				value: value[i] || ''
			});
		}
		
		//Втыкаем кнопку + куда надо
		instance.$addButton.appendTo(instance.$table.find('.ddFieldBlock:last .ddFieldCol:last'));
		
		//Добавляем возможность перетаскивания
		instance.$table.sortable({
			items: 'tr:has(td)',
			handle: '.ddSortHandle',
			cursor: 'n-resize',
			axis: 'y',
			placeholder: 'ui-state-highlight',
			start: function(event, ui){
				ui.placeholder.html('<td colspan="' + (instance.columns.length + 2) + '"><div></div></td>').find('div').css('height', ui.item.height());
			},
			stop: function(event, ui){
				//Находим родителя таблицы, вызываем функцию обновления поля
				_this.moveAddButton({id: instance.id});
			}
		});
	},
	
	/**
	 * @method makeFieldRow
	 * @version 2.0.1 (2016-11-17)
	 * 
	 * @desc Функция создания строки.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.id {string} — TV id.
	 * @param [params.value=''] {string} — Row value.
	 * 
	 * @returns {jQuery}
	 */
	makeFieldRow: function(params){
		//Defaults
		params = $.extend({
			value: ''
		}, params);
		
		var _this = this;
		
		//Если задано максимальное количество строк
		if (_this.instances[params.id].maxRowsNumber){
			//Общее количество строк на данный момент
			var fieldBlocksLen = _this.instances[params.id].$table.find('.ddFieldBlock').length;
			
			//Проверяем превышает ли уже количество строк максимальное
			if (fieldBlocksLen >= _this.instances[params.id].maxRowsNumber){
				return;
			//Если будет равно максимуму при создании этого поля
			}else if (fieldBlocksLen + 1 == _this.instances[params.id].maxRowsNumber){
				_this.instances[params.id].$addButton.attr('disabled', true);
			}
		}
		
		var $fieldBlock = $('<tr class="ddFieldBlock ' + params.id + 'ddFieldBlock"><td class="ddSortHandle"><div></div></td></tr>').appendTo(_this.instances[params.id].$table);
		
		//Разбиваем переданное значение на колонки
		params.value = params.value.split(_this.instances[params.id].colDelimiter);
		
		var $field;
		
		//Перебираем колонки
		$.each(_this.instances[params.id].columns, function(key){
			if (!params.value[key]){params.value[key] = '';}
			if (!_this.instances[params.id].columnsTitles[key]){_this.instances[params.id].columnsTitles[key] = '';}
			if (!_this.instances[params.id].columnsWidth[key] || _this.instances[params.id].columnsWidth[key] == ''){_this.instances[params.id].columnsWidth[key] = _this.instances[params.id].columnsWidth[key - 1];}
			
			var $col = _this.makeFieldCol({$fieldRow: $fieldBlock});
			
			//Если текущая колонка является изображением
			if(_this.instances[params.id].columns[key] == 'image'){
				$field = _this.makeText({
					value: params.value[key],
					title: _this.instances[params.id].columnsTitles[key],
					width: _this.instances[params.id].columnsWidth[key],
					$fieldCol: $col
				});
				
				_this.makeImage({
					id: params.id,
					$fieldCol: $col
				});
				
				//Create Attach browse button
				$('<input class="ddAttachButton" type="button" value="Вставить" />').insertAfter($field).on('click', function(){
					_this.instances[params.id].$currentField = $(this).siblings('.ddField');
					BrowseServer(params.id);
				});
			//Если текущая колонка является файлом
			}else if(_this.instances[params.id].columns[key] == 'file'){
				$field = _this.makeText({
					value: params.value[key],
					title: _this.instances[params.id].columnsTitles[key],
					width: _this.instances[params.id].columnsWidth[key],
					$fieldCol: $col
				});
				
				//Create Attach browse button
				$('<input class="ddAttachButton" type="button" value="Вставить" />').insertAfter($field).on('click', function(){
					_this.instances[params.id].$currentField = $(this).siblings('.ddField');
					BrowseFileServer(params.id);
				});	
			//Если id
			}else if (_this.instances[params.id].columns[key] == 'id'){
				$field = _this.makeText({
					value: params.value[key],
					title: '',
					width: 0,
					$fieldCol: $col
				});
				
				if (!($field.val())){
					$field.val((new Date).getTime());
				}
				
				$col.hide();
			//Если селект
			}else if(_this.instances[params.id].columns[key] == 'select'){
				_this.makeSelect({
					value: params.value[key],
					title: _this.instances[params.id].columnsTitles[key],
					data: _this.instances[params.id].columnsData[key],
					width: _this.instances[params.id].columnsWidth[key],
					$fieldCol: $col
				});
			//Если дата
			}else if(_this.instances[params.id].columns[key] == 'date'){
				_this.makeDate({
					value: params.value[key],
					title: _this.instances[params.id].columnsTitles[key],
					$fieldCol: $col
				});
			//Если textarea
			}else if(_this.instances[params.id].columns[key] == 'textarea'){
				_this.makeTextarea({
					value: params.value[key],
					title: _this.instances[params.id].columnsTitles[key],
					width: _this.instances[params.id].columnsWidth[key],
					$fieldCol: $col
				});
			//Если richtext
			}else if(_this.instances[params.id].columns[key] == 'richtext'){
				_this.makeRichtext({
					value: params.value[key],
					title: _this.instances[params.id].columnsTitles[key],
					width: _this.instances[params.id].columnsWidth[key],
					$fieldCol: $col
				});
			//По дефолту делаем текстовое поле
			}else{
				_this.makeText({
					value: params.value[key],
					title: _this.instances[params.id].columnsTitles[key],
					width: _this.instances[params.id].columnsWidth[key],
					$fieldCol: $col
				});
			}
		});
		
		//Create DeleteButton
		_this.makeDeleteButton({
			id: params.id,
			$fieldCol: _this.makeFieldCol({$fieldRow: $fieldBlock})
		});
		
		//Специально для полей, содержащих изображения необходимо инициализировать
		$('.ddFieldCol:has(.ddField_image) .ddField', $fieldBlock).trigger('change.ddEvents');
		
		return $fieldBlock;
	},
	
	/**
	 * @method makeFieldCol
	 * @version 2.0 (2016-11-16)
	 * 
	 * @desc Создание колонки поля.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.$fieldRow {jQuery} — Target container.
	 * 
	 * @returns {jQuery}
	 */
	makeFieldCol: function(params){
		return $('<td class="ddFieldCol"></td>').appendTo(params.$fieldRow);
	},
	
	/**
	 * @method makeDeleteButton
	 * @version 2.0.1 (2016-11-17)
	 * 
	 * @desc Makes delete button.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.id {string} — TV id.
	 * @param params.$fieldCol {jQuery} — Target container.
	 * 
	 * @returns {void}
	 */
	makeDeleteButton: function(params){
		var _this = this;
		
		$('<input class="ddDeleteButton" type="button" value="×" />').appendTo(params.$fieldCol).on('click', function(){
			//Проверяем на минимальное количество строк
			if (
				_this.instances[params.id].minRowsNumber &&
				_this.instances[params.id].$table.find('.ddFieldBlock').length <= _this.instances[params.id].minRowsNumber
			){
				return;
			}
			
			var $this = $(this),
				$par = $this.parents('.ddFieldBlock:first')/*,
				$table = $this.parents('.ddMultipleField:first')*/;
			
			//Отчистим значения полей
			$par.find('.ddField').val('');
			
			//Если больше одной строки, то можно удалить текущую строчку
			if ($par.siblings('.ddFieldBlock').length > 0){
				$par.fadeOut(300, function(){
					//Если контейнер имеет кнопку добалвения, перенесём её
					if ($par.find('.ddAddButton').length > 0){
						_this.moveAddButton({
							id: params.id,
							$target: $par.prev('.ddFieldBlock')
						});
					}
					
					//Сносим
					$par.remove();
					
					//При любом удалении показываем кнопку добавления
					_this.instances[params.id].$addButton.removeAttr('disabled');
					
					return;
				});
			}
		});
	},
	
	/**
	 * @method makeAddButton
	 * @version 2.0 (2016-11-16)
	 * 
	 * @desc Функция создания кнопки +, вызывается при инициализации.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.id {string} — TV id.
	 * 
	 * @returns {jQuery}
	 */
	makeAddButton: function(params){
		var _this = this;
		
		return $('<input class=\"ddAddButton\" type=\"button\" value=\"+\" />').on('click', function(){
			//Вешаем на кнопку создание новой строки
			$(this).appendTo(_this.makeFieldRow({id: params.id}).find('.ddFieldCol:last'));
		});
	},
	
	/**
	 * @method moveAddButton
	 * @version 2.0.1 (2016-11-17)
	 * 
	 * @desc Перемещение кнопки.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.id {string} — TV id.
	 * @param [params.$target] {string} — Target container.
	 * 
	 * @returns {void}
	 */
	moveAddButton: function(params){
		var _this = this;
		
		//Defaults
		params = $.extend({
			//Если не передали, куда вставлять, вставляем в самый конец
			$target: _this.instances[params.id].$table.find('.ddFieldBlock:last')
		}, params);
		
		//Находим кнопку добавления и переносим куда надо
		_this.instances[params.id].$addButton.appendTo(params.$target.find('.ddFieldCol:last'));
	},
	
	/**
	 * @method makeText
	 * @version 2.0 (2016-11-16)
	 * 
	 * @desc Make text field.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.value {string} — Field value.
	 * @param params.title {string} — Field title.
	 * @param params.width {integer} — Field width.
	 * @param params.$fieldCol {jQuery} — Target container.
	 * 
	 * @returns {jQuery}
	 */
	makeText: function(params){
		var $field = $('<input type="text" title="' + params.title + '" style="width:' + params.width + 'px;" class="ddField" />');
		
		return $field.val(params.value).appendTo(params.$fieldCol);
	},
	
	/**
	 * @method makeDate
	 * @version 2.0 (2016-11-16)
	 * 
	 * @desc Make date field.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.value {string} — Field value.
	 * @param params.title {string} — Field title.
	 * @param params.$fieldCol {jQuery} — Target container.
	 * 
	 * @returns {jQuery}
	 */
	makeDate: function(params){
		//name нужен для DatePicker`а
		var $field = $('<input type="text" title="' + params.title + '" class="ddField DatePicker" name="ddMultipleDate" />').val(params.value).appendTo(params.$fieldCol);
		
		new DatePicker($field.get(0), {
			'yearOffset': $.ddMM.config.datepicker_offset,
			'format': $.ddMM.config.datetime_format + ' hh:mm:00'
		});
		
		return $field;
	},
	
	/**
	 * @method makeTextarea
	 * @version 2.0 (2016-11-16)
	 * 
	 * @desc Make textarea field.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.value {string} — Field value.
	 * @param params.title {string} — Field title.
	 * @param params.width {integer} — Field width.
	 * @param params.$fieldCol {jQuery} — Target container.
	 * 
	 * @returns {jQuery}
	 */
	makeTextarea: function(params){
		return $('<textarea title="' + params.title + '" style="width:' + params.width + 'px;" class="ddField">' + params.value + '</textarea>').appendTo(params.$fieldCol);
	},
	
	/**
	 * @method makeRichtext
	 * @version 2.0 (2016-11-16)
	 * 
	 * @desc Make richtext field.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.value {string} — Field value.
	 * @param params.title {string} — Field title.
	 * @param params.width {integer} — Field width.
	 * @param params.$fieldCol {jQuery} — Target container.
	 * 
	 * @returns {jQuery}
	 */
	makeRichtext: function(params){
		var _this = this,
			$field = $('<div title="' + params.title + '" style="width:' + params.width + 'px;" class="ddField">' + params.value + '</div>').appendTo(params.$fieldCol);
		
		$('<div class="ddFieldCol_edit"><a class="false" href="#">' + $.ddMM.lang.edit + '</a></div>').appendTo(params.$fieldCol).find('a').on('click', function(event){
			_this.richtextWindow = window.open($.ddMM.config.site_url + $.ddMM.urls.mm + 'widgets/ddmultiplefields/richtext/index.php', 'mm_ddMultipleFields_richtext', new Array(
				'width=600',
				'height=550',
				'left=' + (($.ddTools.windowWidth - 600) / 2),
				'top=' + (($.ddTools.windowHeight - 550) / 2),
				'menubar=no',
				'toolbar=no',
				'location=no',
				'status=no',
				'resizable=no',
				'scrollbars=yes'
			).join(','));
			
			if (_this.richtextWindow != null){
				_this.richtextWindow.$ddField = $field;
			}
			
			event.preventDefault();
		});
		
		return $field;
	},
	
	/**
	 * @method makeImage
	 * @version 2.0 (2016-11-16)
	 * 
	 * @desc Make image field.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.id {string} — TV id.
	 * @param params.$fieldCol {jQuery} — Target container.
	 * 
	 * @returns {void}
	 */
	makeImage: function(params){
		var _this = this;
		
		// Create a new preview and Attach a browse event to the picture, so it can trigger too
		$('<div class="ddField_image"><img src="" style="' + _this.instances[params.id].previewStyle + '" /></div>').appendTo(params.$fieldCol).hide().find('img').on('click', function(){
			params.$fieldCol.find('.ddAttachButton').trigger('click');
		}).on('load.ddEvents', function(){
			//Удаление дерьма, блеать (превьюшка, оставленная от виджета showimagetvs)
			$('#' + params.id + 'PreviewContainer').remove();
		});
		
		//Находим поле, привязываем события
		$('.ddField', params.$fieldCol).on('change.ddEvents load.ddEvents', function(){
			var $this = $(this), url = $this.val();
			
			url = (url != '' && url.search(/http:\/\//i) == -1) ? ($.ddMM.config.site_url + url) : url;
			
			//If field not empty
			if (url != ''){
				//Show preview
				$this.siblings('.ddField_image').show().find('img').attr('src', url);
			}else{
				//Hide preview
				$this.siblings('.ddField_image').hide();
			}
		});
	},
	
	/**
	 * @method makeSelect
	 * @version 2.0 (2016-11-16)
	 * 
	 * @desc Функция создания списка.
	 * 
	 * @param params {object_plain} — The parameters.
	 * @param params.value {string} — Field value.
	 * @param params.title {string} — Field title.
	 * @param params.[data] {string_JSON} — Field data.
	 * @param params.data[i] {array} — Item.
	 * @param params.data[i][0] {string} — Item value.
	 * @param params.[data[i][1]=data[i][0]] {string} — Item title.
	 * @param params.width {integer} — Field width.
	 * @param params.$fieldCol {jQuery} — Target container.
	 * 
	 * @returns {jQuery}
	 */
	makeSelect: function(params){
		var $select = $('<select class="ddField">');
		
		if (params.data){
			var dataMas = $.parseJSON(params.data),
				options = '';
			
			$.each(dataMas, function(index){
				options += '<option value="'+ dataMas[index][0] +'">' + (dataMas[index][1] ? dataMas[index][1] : dataMas[index][0]) +'</option>';
			});
			
			$select.append(options);
		}
		
		if (params.value){$select.val(params.value);}
		
		return $select.appendTo(params.$fieldCol);
	},
	
	/**
	 * @method makeNull
	 * @version 2.0 (2016-11-16)
	 * 
	 * @desc Функция ничего не делает.
	 * 
	 * @param params {object_plain} — The parameters.
	 * 
	 * @returns {false}
	 */
	makeNull: function(params){return false;}
};

/**
 * jQuery.fn.mm_ddMultipleFields
 * @version 2.0.2 (2016-11-17)
 * 
 * @desc Делает мультиполя.
 * 
 * @param [params] {object_plain} — The parameters.
 * @param [params.rowDelimiter='||'] {string} — Разделитель строк.
 * @param [params.colDelimiter='::'] {string} — Разделитель колонок.
 * @param [params.columns='field'] {string_commaSeparated|array} — Колонки.
 * @param [params.columnsTitles=''] {string_commaSeparated|array} — Заголовки колонок.
 * @param [params.columnsData=''] {separated string|array} — Данные колонок.
 * @param [params.columnsWidth='180'] {string_commaSeparated} — Ширины колонок.
 * @param [params.previewStyle=''] {string} — Стиль превьюшек.
 * @param [params.minRowsNumber=0] {integer} — Минимальное количество строк.
 * @param [params.maxRowsNumber=0] {integer} — Максимальное количество строк.
 * 
 * @copyright 2013–2014 [DivanDesign]{@link http://www.DivanDesign.biz }
 */
$.fn.mm_ddMultipleFields = function(params){
	var _this = $.ddMM.mm_ddMultipleFields;
	
	//Обрабатываем параметры
	params = $.extend({}, _this.defaults, params || {});
	
	params.columns = $.ddMM.makeArray(params.columns);
	params.columnsTitles = $.ddMM.makeArray(params.columnsTitles);
	params.columnsData = $.ddMM.makeArray(params.columnsData, '\\|\\|');
	params.columnsWidth = $.ddMM.makeArray(params.columnsWidth);
	params.minRowsNumber = parseInt(params.minRowsNumber, 10);
	params.maxRowsNumber = parseInt(params.maxRowsNumber, 10);
	
	return $(this).each(function(){
		//Attach new load event
		$(this).on('load.ddEvents', function(event){
			//Оригинальное поле
			var $this = $(this),
				//id оригинального поля
				id = $this.attr('id');
			
			//Проверим на существование (возникали какие-то непонятные варианты, при которых два раза вызов был)
			if (!_this.instances[id]){
				//Скрываем оригинальное поле
				$this.removeClass('imageField').off('.mm_widget_showimagetvs').addClass('originalField').hide();
				
				//Назначаем обработчик события при изменении (необходимо для того, чтобы после загрузки фотки адрес вставлялся в нужное место)
				$this.on('change.ddEvents', function(){
					//Обновляем текущее мульти-поле
					_this.updateField({id: $this.attr('id')});
				});
				
				//Если это файл или изображение, cкрываем оригинальную кнопку
				$this.next('input[type=button]').hide();
				
				//Создаём мульти-поле
				_this.init($.extend({
					id: id,
					value: $this.val(),
					$parent: $this.parent(),
					$originalField: $this
				}, params));
			}
		}).trigger('load');
	});
};

//On document.ready
$(function(){
	if (typeof(SetUrl) == 'undefined'){
		lastImageCtrl = '';
		lastFileCtrl = '';
		
		OpenServerBrowser = function(url, width, height){
			var iLeft = (screen.width - width) / 2,
				iTop = (screen.height - height) / 2;
			
			var sOptions = 'toolbar=no,status=no,resizable=yes,dependent=yes';
			
			sOptions += ',width=' + width;
			sOptions += ',height=' + height;
			sOptions += ',left=' + iLeft;
			sOptions += ',top=' + iTop;
			
			window.open(url, 'FCKBrowseWindow', sOptions);
		};
		
		BrowseServer = function(ctrl){
			lastImageCtrl = ctrl;
			
			var w = screen.width * 0.5;
			var h = screen.height * 0.5;
			
			OpenServerBrowser($.ddMM.urls.manager + 'media/browser/mcpuk/browser.php?Type=images', w, h);
		};
		
		BrowseFileServer = function(ctrl){
			lastFileCtrl = ctrl;
			
			var w = screen.width * 0.5;
			var h = screen.height * 0.5;
			
			OpenServerBrowser($.ddMM.urls.manager + 'media/browser/mcpuk/browser.php?Type=files', w, h);
		};
		
		SetUrlChange = function(el){
			if ('createEvent' in document){
				var evt = document.createEvent('HTMLEvents');
				
				evt.initEvent('change', false, true);
				el.dispatchEvent(evt);
			}else{
				el.fireEvent('onchange');
			}
		};
		
		SetUrl = function(url, width, height, alt){
			if(lastFileCtrl){
				var c = document.getElementById(lastFileCtrl);
				
				if(c && c.value != url){
					c.value = url;
					SetUrlChange(c);
				}
				
				lastFileCtrl = '';
			}else if(lastImageCtrl){
				var c = document.getElementById(lastImageCtrl);
				
				if(c && c.value != url){
					c.value = url;
					SetUrlChange(c);
				}
				
				lastImageCtrl = '';
			}else{
				return;
			}
		};
	}else{
		//For old MODX versions
		if (typeof(SetUrlChange) == 'undefined'){
			//Copy the existing Image browser SetUrl function
			var oldSetUrl = SetUrl;
			
			//Redefine it to also tell the preview to update
			SetUrl = function(url, width, height, alt){
				var $field = $();
				
				if(lastFileCtrl){
					$field = $(document.mutate[lastFileCtrl]);
				}else if(lastImageCtrl){
					$field = $(document.mutate[lastImageCtrl]);
				}
				
				oldSetUrl(url, width, height, alt);
				
				$field.trigger('change');
			};
		}
	}
	
	//Сабмит главной формы
	$.ddMM.$mutate.on('submit', function(){
		$.each($.ddMM.mm_ddMultipleFields.instances, function(key){
			$.ddMM.mm_ddMultipleFields.updateTv({id: key});
		});
	});
});
})(jQuery);