;(function() {
	'use strict';
	/*
	0 - пустое место
	1 - палуба корабля
	2 - клетка рядом с кораблём
	3 - обстрелянная клетка
	4 - попадание в палубу
	*/

	// флаг начала игры, устанавливается после нажатия кнопки 'Play' и запрещает
	// редактирование положения кораблей
	let startGame = false;
	// флаг установки обработчиков событий ручного размещения кораблей и
	// редактирование их положения
	let isHandlerPlacement = false;
	// флаг установки обработчиков событий ведения морского боя
	let isHandlerController = false;
	// флаг, блокирующий действия игрока во время выстрела компьютера
	let compShot = false;

	// получаем объект элемента DOM по его ID
	const getElement = id => document.getElementById(id);
	// вычисляем координаты всех сторон элемента относительно окна браузера
	// с учётом прокрутки страницы
	const getCoordinates = el => {
		const coords = el.getBoundingClientRect();
		return {
			left: coords.left + window.pageXOffset,
			right: coords.right + window.pageXOffset,
			top: coords.top + window.pageYOffset,
			bottom: coords.bottom + window.pageYOffset
		};
	};

	class Field {
		// размер стороны игрового поля в px
		static FIELD_SIDE = 330;
		// размер палубы корабля в px
		static SHIP_SIDE = 33;
		// объект с данными кораблей
		// ключём будет являться тип корабля, а значением - массив,
		// первый элемент которого указывает кол-во кораблей данного типа,
		// второй элемент указывает кол-во палуб у корабля данного типа
		static SHIP_DATA = {
			fourdeck: [1, 4],
			tripledeck: [2, 3],
			doubledeck: [3, 2],
			singledeck: [4, 1]
		};

		constructor(field) {
			// объект игрового поля, полученный в качестве аргумента
			this.field = field;
			// создаём пустой объект, куда будем заносить данные по каждому созданному кораблю
			// эскадры, подробно эти данные рассмотрим при создании объектов кораблей
			this.squadron = {};
			// двумерный массив, в который заносятся координаты кораблей, а в ходе морского
			// боя, координаты попаданий, промахов и заведомо пустых клеток
			this.matrix = [];
			// получаем координаты всех четырёх сторон рамки игрового поля относительно начала
			// document, с учётом возможной прокрутки по вертикали 
			let { left, right, top, bottom } = getCoordinates(this.field);
			this.fieldLeft = left;
			this.fieldRight = right;
			this.fieldTop = top;
			this.fieldBottom = bottom;
		}

		static createMatrix() {
			return [...Array(10)].map(() => Array(10).fill(0));
		}
		// n - максимальное значение, которое хотим получить
		static getRandom = n => Math.floor(Math.random() * (n + 1));

		cleanField() {
			while (this.field.firstChild) {
				this.field.removeChild(this.field.firstChild);
			}
			this.squadron = {};
			this.matrix = Field.createMatrix();
		}

		randomLocationShips() {
			for (let type in Field.SHIP_DATA) {
				// кол-во кораблей данного типа
				let count = Field.SHIP_DATA[type][0];
				// кол-во палуб у корабля данного типа
				let decks = Field.SHIP_DATA[type][1];
				// прокручиваем кол-во кораблей
				for (let i = 0; i < count; i++) {
					// получаем координаты первой палубы и направление расположения палуб (корабля)
					let options = this.getCoordsDecks(decks);
					// кол-во палуб
					options.decks = decks;
					// имя корабля, понадобится в дальнейшем для его идентификации
					options.shipname = type + String(i + 1);
					// создаём экземпляр корабля со свойствами, указанными в
					// объекте options с помощью класса Ship
					const ship = new Ships(this, options);
					ship.createShip();
				}
			}
		}

		getCoordsDecks(decks) {
			// получаем коэффициенты определяющие направление расположения корабля
			// kx == 0 и ky == 1 — корабль расположен горизонтально,
			// kx == 1 и ky == 0 - вертикально.
			let kx = Field.getRandom(1), ky = (kx == 0) ? 1 : 0,
				x, y;

			// в зависимости от направления расположения, генерируем
			// начальные координаты
			if (kx == 0) {
				x = Field.getRandom(9); y = Field.getRandom(10 - decks);
			} else {
				x = Field.getRandom(10 - decks); y = Field.getRandom(9);
			}

			const obj = {x, y, kx, ky}
			// проверяем валидность координат всех палуб корабля
			const result = this.checkLocationShip(obj, decks);
			// если координаты невалидны, снова запускаем функцию
			if (!result) return this.getCoordsDecks(decks);
			return obj;
		}

		shoreLocationShips() {
			for (let type in Field.SHIP_DATA) {
				// кол-во кораблей данного типа
				let count = Field.SHIP_DATA[type][0];
				// кол-во палуб у корабля данного типа
				let decks = Field.SHIP_DATA[type][1];
				// прокручиваем кол-во кораблей
				for (let i = 0; i < count; i++) {
					// получаем координаты первой палубы и направление расположения палуб (корабля)
					let options = this.getCoordsDecksShore(decks);
					// кол-во палуб
					options.decks = decks;
					// имя корабля, понадобится в дальнейшем для его идентификации
					options.shipname = type + String(i + 1);
					// создаём экземпляр корабля со свойствами, указанными в
					// объекте options с помощью класса Ship
					const ship = new Ships(this, options);
					ship.createShip();
				}
			}
		}

		getCoordsDecksShore(decks) {
			let kx = Field.getRandom(1), ky = (kx == 0) ? 1 : 0,
				x, y;
			if (kx == 0) {
				if(decks>=2){
					x = 0; 
					y = Field.getRandom(10);
				}
				else {
					x = 9; 
					y = Field.getRandom(10);
				}
			} else {
				if(decks>2){
				x = Field.getRandom(10); 
				y = 0;
				}
				else {
					x = Field.getRandom(10); 
					y = 9;
				}
			}

			const obj = {x, y, kx, ky}
			const result = this.checkLocationShip(obj, decks);
			if (!result) return this.getCoordsDecksShore(decks);
			return obj;
		}

		locateShip(location){
			let j=0;
			for (let type in Field.SHIP_DATA) {
				// кол-во кораблей данного типа
				let count = Field.SHIP_DATA[type][0];
				// кол-во палуб у корабля данного типа
				let decks = Field.SHIP_DATA[type][1];
				// прокручиваем кол-во кораблей
				for (let i = 0; i < count; i++) {
					// получаем координаты первой палубы и направление расположения палуб (корабля)
					//let options = this.getCoordsDecks(decks);
					let options=location[j];
					//options.x =location[j][0];
					//options.y=location[j][1];
					//options.kx=location[j][2];
					//options.ky=location[j][3];
					// кол-во палуб
					options.decks = decks;
					// имя корабля, понадобится в дальнейшем для его идентификации
					options.shipname = type + String(i + 1);
					// создаём экземпляр корабля со свойствами, указанными в
					// объекте options с помощью класса Ship
					const ship = new Ships(this, options);
					ship.createShip();
					j++;
				}
			}
		}

		checkLocationShip(obj, decks) {
			let { x, y, kx, ky, fromX, toX, fromY, toY } = obj;

			// формируем индексы, ограничивающие двумерный массив по оси X (строки)
			// если координата 'x' равна нулю, то это значит, что палуба расположена в самой
			// верхней строке, т. е. примыкает к верхней границе и началом цикла будет строка
			// с индексом 0, в противном случае, нужно начать проверку со строки с индексом
			// на единицу меньшим, чем у исходной, т.е. находящейся выше исходной строки
			fromX = (x == 0) ? x : x - 1;
			// если условие истинно - это значит, что корабль расположен вертикально и его
			// последняя палуба примыкает к нижней границе игрового поля
			// поэтому координата 'x' последней палубы будет индексом конца цикла
			if (x + kx * decks == 10 && kx == 1) toX = x + kx * decks;
			// корабль расположен вертикально и между ним и нижней границей игрового поля
			// есть, как минимум, ещё одна строка, координата этой строки и будет
			// индексом конца цикла
			else if (x + kx * decks < 10 && kx == 1) toX = x + kx * decks + 1;
			// корабль расположен горизонтально вдоль нижней границы игрового поля
			else if (x == 9 && kx == 0) toX = x + 1;
			// корабль расположен горизонтально где-то по середине игрового поля
			else if (x < 9 && kx == 0) toX = x + 2;

			// формируем индексы начала и конца выборки по столбцам
			// принцип такой же, как и для строк
			fromY = (y == 0) ? y : y - 1;
			if (y + ky * decks == 10 && ky == 1) toY = y + ky * decks;
			else if (y + ky * decks < 10 && ky == 1) toY = y + ky * decks + 1;
			else if (y == 9 && ky == 0) toY = y + 1;
			else if (y < 9 && ky == 0) toY = y + 2;

			if (toX === undefined || toY === undefined) return false;

			// отфильтровываем ячейки, получившегося двумерного массива,
			// содержащие 1, если такие ячейки существуют - возвращаем false
			if (this.matrix.slice(fromX, toX)
				.filter(arr => arr.slice(fromY, toY).includes(1))
				.length > 0) return false;
			return true;
		}
	}

	///////////////////////////////////////////

	class Ships {
		constructor(self, { x, y, kx, ky, decks, shipname }) {
			// с каким экземпляром работаем
			this.player = (self === human) ? human : computer;
			// this.player = self;
			// на каком поле создаётся данный корабль
			this.field = self.field;
			// уникальное имя корабля
			this.shipname = shipname;
			//количество палуб
			this.decks = decks;
			// координата X первой палубы
			this.x = x;
		 	// координата Y первой палубы
			this.y = y;
			// направлении расположения палуб
			this.kx = kx;
			this.ky = ky;
			// счётчик попаданий
			this.hits = 0;
			// массив с координатами палуб корабля, является элементом squadron
			this.arrDecks = [];
		}

		static showShip(self, shipname, x, y, kx) {
			// создаём новый элемент с указанным тегом
			const div = document.createElement('div');
			// из имени корабля убираем цифры и получаем имя класса
			const classname = shipname.slice(0, -1);
			// получаем имя класса в зависимости от направления расположения корабля
			const dir = (kx == 1) ? ' vertical' : '';

			// устанавливаем уникальный идентификатор для корабля
			div.setAttribute('id', shipname);
			// собираем в одну строку все классы 
			div.className = `ship ${classname}${dir}`;
			// через атрибут 'style' задаём позиционирование кораблю относительно
			// его родительского элемента
			// смещение вычисляется путём умножения координаты первой палубы на
			// размер клетки игрового поля, этот размер совпадает с размером палубы
			div.style.cssText = `left:${y * Field.SHIP_SIDE}px; top:${x * Field.SHIP_SIDE}px;`;
			self.field.appendChild(div);
		}

		createShip() {
			let { player, field, shipname, decks, x, y, kx, ky, hits, arrDecks, k = 0 } = this;

			while (k < decks) {
				// записываем координаты корабля в двумерный массив игрового поля
				// теперь наглядно должно быть видно, зачем мы создавали два
				// коэффициента направления палуб
				// если коэффициент равен 1, то соответствующая координата будет
				// увеличиваться при каждой итерации
				// если равен нулю, то координата будет оставаться неизменной
				// таким способом мы очень сократили и унифицировали код
				let i = x + k * kx, j = y + k * ky;

				// значение 1, записанное в ячейку двумерного массива, говорит о том, что
				// по данным координатам находится палуба некого корабля
				player.matrix[i][j] = 1;
				// записываем координаты палубы
				arrDecks.push([i, j]);
				k++;
			}

			// заносим информацию о созданном корабле в объект эскадры
			player.squadron[shipname] = {arrDecks, hits, x, y, kx, ky};
			// если корабль создан для игрока, выводим его на экран
			if (player === human) {
				Ships.showShip(human, shipname, x, y, kx);
				// когда количество кораблей в эскадре достигнет 10, т.е. все корабли
				// сгенерированны, то можно показать кнопку запуска игры
				if (Object.keys(player.squadron).length == 10) {
					buttonPlay.dataset.hidden = false;
					buttonSave.dataset.hidden = false;
					buttonLoad.dataset.hidden = false;
				}
			}
		}
	}

	///////////////////////////////////////////

	class Placement {
		constructor() {
			this.field = humanfield;
			this.dragObject = {};
			this.pressed = false;

			let { left, right, top, bottom } = getCoordinates(this.field);
			this.fieldLeft = left;
			this.fieldRight = right;
			this.fieldTop = top;
			this.fieldBottom = bottom;
		}

		static getShipName = el => el.getAttribute('id');
		static getCloneDecks = el => {
			const type = el.getAttribute('id').slice(0, -1);
			return Field.SHIP_DATA[type][1];
		}

		setObserver() {
			if (isHandlerPlacement) return;
			document.addEventListener('mousedown', this.onMouseDown.bind(this));
			this.field.addEventListener('contextmenu', this.rotationShip.bind(this));
			document.addEventListener('mousemove', this.onMouseMove.bind(this));
			document.addEventListener('mouseup', this.onMouseUp.bind(this));
			isHandlerPlacement = true;
		}

		onMouseDown(e) {
			if (e.which != 1 || startGame) return;

			const el = e.target.closest('.ship');
			if(!el) return;
			this.pressed = true;

			// переносимый объект и его свойства
			this.dragObject = {
				el,
				parent: el.parentElement,
				next: el.nextElementSibling,
				// координаты, с которых начат перенос
				downX: e.pageX,
				downY: e.pageY,
				left: el.offsetLeft,
				top: el.offsetTop,
				// горизонтальное положение корабля
				kx: 0,
				ky: 1
			};

			// редактируем положение корабля на игровом поле
			if (el.parentElement === this.field) {
				const name = Placement.getShipName(el);
				this.dragObject.kx = human.squadron[name].kx;
				this.dragObject.ky = human.squadron[name].ky;
			}
		}

		onMouseMove(e) {
			if (!this.pressed || !this.dragObject.el) return;

			let { left, right, top, bottom } = getCoordinates(this.dragObject.el);

			if (!this.clone) {
				this.decks = Placement.getCloneDecks(this.dragObject.el);
				this.clone = this.creatClone({left, right, top, bottom}) || null;
				if (!this.clone) return;

				// вычисляем сдвиг курсора по координатам X и Y
				this.shiftX = this.dragObject.downX - left;
				this.shiftY = this.dragObject.downY - top;
				// z-index нужен для позиционирования клона над всеми элементами DOM
				this.clone.style.zIndex = '1000';
				// перемещаем клон в BODY
				document.body.appendChild(this.clone);

				// удаляем устаревший экземпляр корабля, если он существует
				this.removeShipFromSquadron(this.clone);
			}

			// координаты клона относительно BODY с учётом сдвига курсора
			// относительно верней левой точки
			let currentLeft = Math.round(e.pageX - this.shiftX),
					currentTop = Math.round(e.pageY - this.shiftY);
			this.clone.style.left = `${currentLeft}px`;
			this.clone.style.top = `${currentTop}px`;

			// проверяем, что клон находится в пределах игрового поля, с учётом
			// небольших погрешностей (14px )
			if (left >= this.fieldLeft - 14 && right <= this.fieldRight + 14 && top >= this.fieldTop - 14 && bottom <= this.fieldBottom + 14) {
				const coords = this.getCoordsCloneInMatrix({left, right, top, bottom});
				const obj = {
					x: coords.x,
					y: coords.y,
					kx: this.dragObject.kx,
					ky: this.dragObject.ky
				};

				const result = human.checkLocationShip(obj, this.decks);
				if (result) {
					// клон находится в пределах игрового поля,
					// подсвечиваем его контур зелёным цветом
					this.clone.classList.remove('unsuccess');
					this.clone.classList.add('success');
				} else {
					// в соседних клетках находятся ранее установленные корабли,
					// подсвечиваем его контур красным цветом
					this.clone.classList.remove('success');
					this.clone.classList.add('unsuccess');
				}
			} else {
				// клон находится за пределами игрового поля,
				// подсвечиваем его контур красным цветом
				this.clone.classList.remove('success');
				this.clone.classList.add('unsuccess');
			}
		}

		onMouseUp() {
			this.pressed = false;
			if (!this.clone) return;				

			if (this.clone.classList.contains('unsuccess')) {
				this.clone.classList.remove('unsuccess');
				this.clone.rollback();
			} else {
				this.createShipAfterEditing();
			}

			// удаляем объекты 'clone' и 'dragObject'
			this.removeClone();
		}

		rotationShip(e) {
			// запрещаем появление контекстного меню
			e.preventDefault();
			if (e.which != 3 || startGame) return;

			const el = e.target.closest('.ship');
			const name = Placement.getShipName(el);

			if (human.squadron[name].decks == 1) return;

			const obj = {
				kx: (human.squadron[name].kx == 0) ? 1 : 0,
				ky: (human.squadron[name].ky == 0) ? 1 : 0,
				x: human.squadron[name].x,
				y: human.squadron[name].y
			};
			const decks = human.squadron[name].arrDecks.length;
			this.removeShipFromSquadron(el);
			human.field.removeChild(el);
			const result = human.checkLocationShip(obj, decks);

			if(!result) {
				obj.kx = (obj.kx == 0) ? 1 : 0;
				obj.ky = (obj.ky == 0) ? 1 : 0;
			}

			// добавляем в объект свойства нового корабля
			obj.shipname = name;
			obj.decks = decks;

			// создаём экземпляр нового корабля
			const ship = new Ships(human, obj);
			ship.createShip();

			if (!result) {
				const el = getElement(name);
				el.classList.add('unsuccess');
				setTimeout(() => { el.classList.remove('unsuccess') }, 750);
			}
		}

		creatClone(coords) {
			const clone = this.dragObject.el;
			const oldPosition = this.dragObject;

			clone.rollback = () => {
				if (oldPosition.parent == this.field) {
					clone.style.left = `${oldPosition.left}px`;
					clone.style.top = `${oldPosition.top}px`;
					clone.style.zIndex = '';
					oldPosition.parent.insertBefore(clone, oldPosition.next);
					this.createShipAfterEditing();
				} else {
					clone.removeAttribute('style');
					oldPosition.parent.insertBefore(clone, oldPosition.next);
				}
			};
			return clone;
		};

		removeClone() {
			delete this.clone;
			this.dragObject = {};
		}

		createShipAfterEditing() {
			// получаем координаты, пересчитанные относительно игрового поля
			const coords = getCoordinates(this.clone);
			let { left, top, x, y } = this.getCoordsCloneInMatrix(coords);
			this.clone.style.left = `${left}px`;
			this.clone.style.top = `${top}px`;
			// переносим клон внутрь игрового поля
			this.field.appendChild(this.clone);
			this.clone.classList.remove('success');

			// создаём объект со свойствами нового корабля
			const options = {
				shipname: Placement.getShipName(this.clone),
				x,
				y,
				kx: this.dragObject.kx,
				ky: this.dragObject.ky,
				decks: this.decks
			};

			// создаём экземпляр нового корабля
			const ship = new Ships(human, options);
			ship.createShip();
			// теперь в игровом поле находится сам корабль, поэтому его клон удаляем из DOM
			this.field.removeChild(this.clone);
		}

		getCoordsCloneInMatrix({left, right, top, bottom} = coords) {
			let computedLeft = left - this.fieldLeft,
				computedRight = right - this.fieldLeft,
				computedTop = top - this.fieldTop,
				computedBottom = bottom - this.fieldTop;

			// создаём объект, куда поместим итоговые значения
			const obj = {};

			// в результате выполнения условия, убираем неточности позиционирования клона
			let ft = (computedTop < 0) ? 0 : (computedBottom > Field.FIELD_SIDE) ? Field.FIELD_SIDE - Field.SHIP_SIDE : computedTop;
			let fl = (computedLeft < 0) ? 0 : (computedRight > Field.FIELD_SIDE) ? Field.FIELD_SIDE - Field.SHIP_SIDE * this.decks : computedLeft;

			obj.top = Math.round(ft / Field.SHIP_SIDE) * Field.SHIP_SIDE;
			obj.left = Math.round(fl / Field.SHIP_SIDE) * Field.SHIP_SIDE;
			// переводим значение в координатах матрицы
			obj.x = obj.top / Field.SHIP_SIDE;
			obj.y = obj.left / Field.SHIP_SIDE;

			return obj;
		}

		removeShipFromSquadron(el) {
			const name = Placement.getShipName(el);
			if (!human.squadron[name]) return;

			const arr = human.squadron[name].arrDecks;
			for (let coords of arr) {
				const [x, y] = coords;
				human.matrix[x][y] = 0;
			}
			delete human.squadron[name];
		}
	}

	///////////////////////////////////////////

	class Controller {
		// массив базовых координат для формирования coordsFixed
		static START_POINTS = [
			[ [6,0], [2,0], [0,2], [0,6] ],
			[ [3,0], [7,0], [9,2], [9,6] ]
		];
		static SERVICE_TEXT = getElement('service_text');

		constructor() {
			this.player = '';
			this.opponent = '';
			this.text = '';
			// массив с координатами выстрелов при рандомном выборе
			this.coordsRandom = [];
			// массив с заранее вычисленными координатами выстрелов
			this.coordsFixed = [];
			// массив с координатами вокруг клетки с попаданием
			this.coordsAroundHit = [];
			// временный объект корабля, куда будем заносить координаты
			// попаданий, расположение корабля, количество попаданий
			this.resetTempShip();
		}

		static showServiceText = text => {
			Controller.SERVICE_TEXT.innerHTML = text;
		}

		static getCoordsIcon(el) {
			const x = el.style.top.slice(0, -2) / Field.SHIP_SIDE;
			const y = el.style.left.slice(0, -2) / Field.SHIP_SIDE;
			return [x, y];
		}

		static removeElementArray(arr, [x, y]) {
			return arr.filter(item => item[0] != x || item[1] != y);
		}

		init() {
			// Рандомно выбираем игрока и его противника
			const random = Field.getRandom(1);			
			this.player = (random == 0) ? human : computer;
			this.opponent = (this.player === human) ? computer : human;

			// генерируем координаты выстрелов компьютера и заносим их в
			// массивы coordsRandom и coordsFixed
			this.setCoordsShot();

			// обработчики события для игрока
			if (!isHandlerController) {
				computerfield.addEventListener('click', this.makeShot.bind(this));
				computerfield.addEventListener('contextmenu', this.setUselessCell.bind(this));
				isHandlerController = true;
			}

			if (this.player === human) {
				compShot = false;
				this.text = 'Вы стреляете первым';
			} else {
				compShot = true;
				this.text = 'Первым стреляет компьютер';
				setTimeout(() => this.makeShot(), 2000);
			}
			Controller.showServiceText(this.text);
		}

		setCoordsShot() {
			for (let i = 0; i < 10; i++) {
				for(let j = 0; j < 10; j++) {
					this.coordsRandom.push([i, j]);
				}
			}
			this.coordsRandom.sort((a, b) => Math.random() - 0.5);

			let x, y;

			for (let arr of Controller.START_POINTS[0]) {
				x = arr[0]; y = arr[1];
				while (x <= 9 && y <= 9) {
					this.coordsFixed.push([x, y]);
					x = (x <= 9) ? x : 9;
					y = (y <= 9) ? y : 9;
					x++; y++;
				}
			}

			for (let arr of Controller.START_POINTS[1]) {
				x = arr[0]; y = arr[1];
				while(x >= 0 && x <= 9 && y <= 9) {
					this.coordsFixed.push([x, y]);
					x = (x >= 0 && x <= 9) ? x : (x < 0) ? 0 : 9;
					y = (y <= 9) ? y : 9;
					x--; y++;
				};
			}
			this.coordsFixed = this.coordsFixed.reverse();
		}

		setCoordsAroundHit(x, y) {
			let {firstHit, kx, ky} = this.tempShip;
			let arr = [];

			if (firstHit.length == 0) {
				this.tempShip.firstHit = [x, y];
			} else if (kx == 0 && ky == 0) {
				this.tempShip.kx = (Math.abs(firstHit[0] - x) == 1) ? 1 : 0;
				this.tempShip.ky = (Math.abs(firstHit[1] - y) == 1) ? 1: 0;
			}

			// вертикальное расположение
			if (x > 0) this.coordsAroundHit.push([x - 1, y]);
			if (x < 9) this.coordsAroundHit.push([x + 1, y]);
			// горизонтальное расположение
			if (y > 0) this.coordsAroundHit.push([x, y - 1]);
			if (y < 9) this.coordsAroundHit.push([x, y + 1]);

			// валидация координат с помощью фильтра
			arr = this.coordsAroundHit.filter(([x, y]) => human.matrix[x][y] == 0 || human.matrix[x][y] == 1);
			this.coordsAroundHit = [...arr];
		}

		setUselessCell(e) {
			e.preventDefault();
			if (e !== undefined && e.which != 3 || compShot) return;

			const coords = this.transformCoordsInMatrix(e, computer);
			const check = this.checkUselessCell(coords);
			if (check) {
				this.showIcons(this.opponent, coords, 'shaded-cell');
			} 
		}

		transformCoordsInMatrix(e, self) {
			const x = Math.trunc((e.pageY - self.fieldTop) / Field.SHIP_SIDE);
			const y = Math.trunc((e.pageX - self.fieldLeft) / Field.SHIP_SIDE);
			return [x, y];
		}

		removeCoordsFromArrays(coords) {
			if (this.coordsAroundHit.length > 0) {
				this.coordsAroundHit = Controller.removeElementArray(this.coordsAroundHit, coords);
			}
			if (this.coordsFixed.length > 0) {
				this.coordsFixed = Controller.removeElementArray(this.coordsFixed, coords);
			}
			this.coordsRandom = Controller.removeElementArray(this.coordsRandom, coords);
		}

		checkUselessCell (coords) {
			if (computer.matrix[coords[0]][coords[1]] > 1) return false;

			const icons = this.opponent.field.querySelectorAll('.icon-field');
			if (icons.length == 0) return true;

			for (let icon of icons) {
				const [x, y] = Controller.getCoordsIcon(icon);
				if (coords[0] == x && coords[1] == y && icon.classList.contains('shaded-cell')) {
					const f = (new Error()).stack.split('\n')[2].trim().split(' ')[1];
					if (f == 'Controller.setUselessCell') {
						icon.parentElement.removeChild(icon);
					} else {
						// окрашиваем иконку в красный цвет
						icon.classList.add('shaded-cell_red');
						setTimeout(() => { icon.classList.remove('shaded-cell_red') }, 500);
					}
					return false;
				}
			}
			return true;
		}

		markUselessCell(coords) {
			let n = 0, x, y;
			for (let coord of coords) {
				x = coord[0]; y = coord[1];
				// за пределами игрового поля
				if (x < 0 || x > 9 || y < 0 || y > 9) continue;
				// что-то уже есть
				if (human.matrix[x][y] != 0) continue;
				human.matrix[x][y] = 2;
				n++;
				setTimeout(() => this.showIcons(human, coord, 'shaded-cell'), 350 * n);
				// удаляем полученные координаты из всех массивов
				this.removeCoordsFromArrays(coord);
			}
		}

		markUselessCellAroundShip(coords){
			const {hits, kx, ky, x0, y0} = this.tempShip;
			let points;

			// однопалубный корабль
			if (this.tempShip.hits == 1) {
				points = [
					// верхняя
					[x0 - 1, y0],
					// нижняя
					[x0 + 1, y0],
					// левая
					[x0, y0 - 1],
					// правая
					[x0, y0 + 1]
				];
			// многопалубный корабль
			} else {
				points = [
					// левая / верхняя
					[x0 - kx, y0 - ky],
					// правая / нижняя
					[x0 + kx * hits, y0 + ky * hits]
				];
			}
			this.markUselessCell(points);
		}

		showIcons(opponent, [x, y], iconClass) {
			const field = opponent.field;
			if (iconClass === 'dot' || iconClass === 'red-cross') {
				setTimeout(() => fn(), 400);
			} else {
				fn();
			}
			function fn() {
				const span = document.createElement('span');
				span.className = `icon-field ${iconClass}`;
				span.style.cssText = `left:${y * Field.SHIP_SIDE}px; top:${x * Field.SHIP_SIDE}px;`;
				field.appendChild(span);
			}
		}

		getCoordsForShot() {
			const coords = (this.coordsAroundHit.length > 0) ? this.coordsAroundHit.pop() : (this.coordsFixed.length > 0) ? this.coordsFixed.pop() : this.coordsRandom.pop();
			
			// удаляем полученные координаты из всех массивов
			this.removeCoordsFromArrays(coords);
			return coords;
		}

		resetTempShip() {
			this.tempShip = {
				hits: 0,
				firstHit: [],
				kx: 0,
				ky: 0
			};
		}

		makeShot(e) {
			let x, y;
			if (e !== undefined) {
				if (e.which != 1 || compShot) return;
				([x, y] = this.transformCoordsInMatrix(e, this.opponent));

				// проверяем наличие иконки 'shaded-cell' по полученым координатам
				const check = this.checkUselessCell([x, y]);
				if (!check) return;
			} else {
				// получаем координаты для выстрела компьютера
				([x, y] = this.getCoordsForShot());
			}

			// показываем и удаляем иконку выстрела
			this.showIcons(this.opponent, [x, y], 'explosion');
			const explosion = this.opponent.field.querySelector('.explosion');
			setTimeout(() => explosion.classList.add('active'), 0);
			setTimeout(() => explosion.classList.remove('active'), 250);
			setTimeout(() => explosion.parentElement.removeChild(explosion), 300);

			const v	= this.opponent.matrix[x][y];
			switch(v) {
				case 0: // промах
					this.miss(x, y);
					break;
				case 1: // попадание
					this.hit(x, y);
					break;
				case 3: // повторный обстрел
				case 4:
					Controller.showServiceText('По этим координатам вы уже стреляли!');
					break;
			}
		}

		miss(x, y) {
			let text = '';
			// устанавливаем иконку промаха и записываем промах в матрицу
			this.showIcons(this.opponent, [x, y], 'dot');
			this.opponent.matrix[x][y] = 3;

			// определяем статус игроков
			if (this.player === human) {
				text = 'Вы промахнулись. Стреляет компьютер.';
				this.player = computer;
				this.opponent = human;
				compShot = true;
				setTimeout(() => this.makeShot(), 2000);
			} else {
				text = 'Компьютер промахнулся. Ваш выстрел.';

				// обстреляны все возможные клетки для данного корабля
				if (this.coordsAroundHit.length == 0 && this.tempShip.hits > 0) {
					// корабль потоплен, отмечаем useless cell вокруг него
					this.markUselessCellAroundShip([x, y]);
					this.resetTempShip();
				}
				this.player = human;
				this.opponent = computer;
				compShot = false;
			}
			setTimeout(() => Controller.showServiceText(text), 400);
		}

		hit(x, y) {
			let text = '';
			// устанавливаем иконку попадания и записываем попадание в матрицу
			this.showIcons(this.opponent, [x, y], 'red-cross');
			this.opponent.matrix[x][y] = 4;
			text = (this.player === human) ? 'Поздравляем! Вы попали. Ваш выстрел.' : 'Компьютер попал в ваш корабль. Выстрел компьютера';
			setTimeout(() => Controller.showServiceText(text), 400);

			// увеличиваем счётчик попаданий
			// если счётчик === количеству палуб, удаляем корабль из эскадры
			for (let name in this.opponent.squadron) {
				const dataShip = this.opponent.squadron[name];
				for (let value of dataShip.arrDecks) {
					if (value[0] == x && value[1] == y) {
						dataShip.hits++;
						if (dataShip.hits == dataShip.arrDecks.length) {
							if (this.opponent === human) {
								// код компьютера: сохраняем координаты первой палубы
								this.tempShip.x0 = dataShip.x;
								this.tempShip.y0 = dataShip.y;
							}
							delete this.opponent.squadron[name];
						}
					}
				}
			}

			// все корабли эскадры уничтожены
			if (Object.keys(this.opponent.squadron).length == 0) {
				if (this.opponent === human) {
					text = 'К сожалению, вы проиграли.';
					// показываем оставшиеся корабли компьютера
					for (let name in computer.squadron) {
						const dataShip = computer.squadron[name];
						Ships.showShip(computer, name, dataShip.x, dataShip.y, dataShip.kx );
					}
				} else {
					text = 'Поздравляем! Вы выиграли!';
				}
				Controller.showServiceText(text);
				buttonNewGame.dataset.hidden = false;
			// бой продолжается
			} else if (this.opponent === human) {
				this.tempShip.hits++;
				// отмечаем клетки по диагонали, где точно не может стоять корабль
				const coords = [
					[x - 1, y - 1],
					[x - 1, y + 1],
					[x + 1, y - 1],
					[x + 1, y + 1]
				];
				this.markUselessCell(coords);

				// формируем координаты обстрела вокруг попадания
				this.setCoordsAroundHit(x, y);

				// max кол-во палуб у оставшихся кораблей
				let obj = Object.values(human.squadron)
					.reduce((a, b) => a.arrDecks.length > b.arrDecks.length ? a : b);
				// определяем, есть ли ещё корабли, с кол-вом палуб больше, чем попаданий
				if (this.tempShip.hits >= obj.arrDecks.length || this.coordsAroundHit.length == 0) {
					// корабль потоплен, отмечаем useless cell вокруг него
					this.markUselessCellAroundShip(coords);
					this.coordsAroundHit = [];
					this.resetTempShip();
				}
				setTimeout(() => this.makeShot(), 2000);
			}
		}
	}

	///////////////////////////////////////////

	// контейнер, в котором будут размещаться корабли, предназначенные для перетаскивания
	// на игровое поле
	const shipsCollection = getElement('ships_collection');
	// контейнер с набором кораблей, предназначенных для перетаскивания
	// на игровое поле
	const initialShips = document.querySelector('.wrap + .initial-ships');
	// контейнер с заголовком
	const toptext = getElement('text_top');
	// кнопка начала игры
	const buttonPlay = getElement('play');
	// кнопка перезапуска игры
	const buttonNewGame = getElement('newgame');
	const buttonSave = getElement('save');
	const buttonLoad = getElement('load');
	// получаем экземпляр игрового поля игрока
	const humanfield = getElement('field_human');
	const human = new Field(humanfield);

	// экземпляр игрового поля только регистрируем
	const computerfield = getElement('field_computer');
    let computer = {};
    
    

	getElement('type_placement').addEventListener('click', function(e) {
		// используем делегирование основанное на всплытии событий
		if (e.target.tagName != 'SPAN') return;

		// если мы уже создали эскадру ранее, то видна кнопка начала игры
		// скроем её на время повторной расстановки кораблей
		buttonPlay.dataset.hidden = true;
		buttonLoad.dataset.hidden = true;
		buttonSave.dataset.hidden = true;
		// очищаем игровое поле игрока перед повторной расстановкой кораблей
		human.cleanField();
		let shoreLocation={
			0:{
				"x": 0,
				"y": 0,
				"kx": 1,
				"ky": 0,
			},
			1:{
				"x": 0,
				"y": 6,
				"kx": 0,
				"ky": 1,
			},
			2:{
				"x": 6,
				"y": 9,
				"kx": 1,
				"ky": 0,
			},
			3:{
				"x": 7,
				"y": 0,
				"kx": 1,
				"ky": 0,
			},
			4:{
				"x": 9,
				"y": 4,
				"kx": 0,
				"ky": 1,
			},
			5:{
				"x": 2,
				"y": 9,
				"kx": 1,
				"ky": 0,
			},
			6:{
				"x": 0,
				"y": 2,
				"kx": 1,
				"ky": 0,
			},
			7:{
				"x": 5,
				"y": 0,
				"kx": 1,
				"ky": 0,
			},
			8:{
				"x": 9,
				"y": 2,
				"kx": 1,
				"ky": 0,
			},
			9:{
				"x": 9,
				"y": 7,
				"kx": 1,
				"ky": 0,
			},
		};
		let halfLocation={
			0:{
				"x": 0,
				"y": 9,
				"kx": 1,
				"ky": 0,
			},
			1:{
				"x": 0,
				"y": 0,
				"kx": 1,
				"ky": 0,
			},
			2:{
				"x": 4,
				"y": 5,
				"kx": 0,
				"ky": 1,
			},
			3:{
				"x": 0,
				"y": 6,
				"kx": 0,
				"ky": 1,
			},
			4:{
				"x": 3,
				"y": 2,
				"kx": 0,
				"ky": 1,
			},
			5:{
				"x": 0,
				"y": 3,
				"kx": 1,
				"ky": 0,
			},
			6:{
				"x": 6,
				"y": 1,
				"kx": 1,
				"ky": 0,
			},
			7:{
				"x": 9,
				"y": 2,
				"kx": 1,
				"ky": 0,
			},
			8:{
				"x": 7,
				"y": 5,
				"kx": 1,
				"ky": 0,
			},
			9:{
				"x": 6,
				"y": 8,
				"kx": 1,
				"ky": 0,
			},
		};
		// 
		let initialShipsClone = '';
		// способ расстановки кораблей на игровом поле
		const type = e.target.dataset.target;
		// создаём литеральный объект typeGeneration
		// каждому свойству литерального объекта соответствует анонимная функция
		// в которой вызывается рандомная или ручная расстановка кораблей
		const typeGeneration = {
			random() {
				// скрываем контейнер с кораблями, предназначенными для перетаскивания
				// на игровое поле
				shipsCollection.hidden = true;
				// вызов ф-ии рандомно расставляющей корабли для экземпляра игрока
				//human.shoreLocationShips();
				human.locateShip(shoreLocation);
			},
			randomHalf(){
				shipsCollection.hidden = true;
				// вызов ф-ии рандомно расставляющей корабли для экземпляра игрока
				//human.shoreLocationShips();
				human.locateShip(halfLocation);
			},
			manually() {
				// этот код мы рассмотрим, когда будем реализовывать
				// расстановку кораблей перетаскиванием на игровое поле
				let value = !shipsCollection.hidden;

				if (shipsCollection.children.length > 1) {
					shipsCollection.removeChild(shipsCollection.lastChild);
				}

				if (!value) {
					initialShipsClone = initialShips.cloneNode(true);
					shipsCollection.appendChild(initialShipsClone);
					initialShipsClone.hidden = false;
				}

				shipsCollection.hidden = value;
			}
		};
		// вызов анонимной функции литерального объекта в зависимости
		// от способа расстановки кораблей
		typeGeneration[type]();

		const placement = new Placement();
		placement.setObserver();
	});

	let battle = null;


	buttonPlay.addEventListener('click', function(e) {
		buttonPlay.dataset.hidden = true;
		buttonSave.dataset.hidden = true;
		buttonLoad.dataset.hidden = true;
		instruction.hidden = true;
		computerfield.parentElement.hidden = false;
		toptext.innerHTML = 'Морской бой между эскадрами';

		computer = new Field(computerfield);
		computer.cleanField();
		computer.randomLocationShips();
		console.log(human.squadron);
		startGame = true;

		if (!battle) battle = new Controller();
		battle.init();
	});

	buttonNewGame.addEventListener('click', function(e) {
		/*buttonNewGame.dataset.hidden = true;
		computerfield.parentElement.hidden = true;
		instruction.hidden = false;
		human.cleanField();
		toptext.innerHTML = 'Расстановка кораблей';
		Controller.SERVICE_TEXT.innerHTML = '';

		startGame = false;
		compShot = false;

		battle.coordsRandom = [];
		battle.coordsFixed = [];
		battle.coordsAroundHit = [];
		battle.resetTempShip();*/
		window.location.reload();
	});

	buttonSave.addEventListener('click',()=>{

	})

	/////////////////////////////////////////////////

	function printMatrix() {
		let print = '';
		for (let x = 0; x < 10; x++) {
			for (let y = 0; y < 10; y++) {
				print += human.matrix[x][y];
			}
			print += '<br>';
		}
		getElement('matrix').innerHTML = print;
	}
})();