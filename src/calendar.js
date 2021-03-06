/**
 * @Description: 
 * @Author: Jea杨(JJonline@JJonline.Cn)
 * @Date: 2014-7-21
 * @charset UTF-8
 * @Time    2014-7-21
 * @Time    2016-8-13 Fixed 2033hex、Attribution Annals
 * @Time    2016-9-25 Fixed lunar LeapMonth Param Bug
 * @Time    2017-7-24 Fixed use getTerm Func Param Error.use solar year,NOT lunar year
 * @Version 1.0.3
 * @公历转农历：calendar.solar2lunar(1987,11,01); //[you can ignore params of prefix 0]
 * @农历转公历：calendar.lunar2solar(1987,09,10); //[you can ignore params of prefix 0]
 * @last author: bubao
 * @last edit time: 2020-09-21 19:44:02
 */
const CONSTANT = require("./constant.js");

class Calendar {
	/**
	  * 返回农历y年一整年的总天数
	  * @param {number} y lunar Year
	  * @return Number
	  * @eg:var count = lYearDays(1987) ;//count=387
	  */
	lYearDays(y) {
		let sum = 348;
		for (let i = 0x8000; i > 0x8; i >>= 1) { sum += (CONSTANT.lunarInfo[y - 1900] & i) ? 1 : 0; }
		return (sum + this.leapDays(y));
	}

	/**
	  * 返回农历y年闰月是哪个月；若y年没有闰月 则返回0
	  * @param {number} y lunar Year
	  * @return Number (0-12)
	  * @eg:var leapMonth = leapMonth(1987) ;//leapMonth=6
	  */
	leapMonth(y) { //闰字编码 \u95f0
		return (CONSTANT.lunarInfo[y - 1900] & 0xf);
	}

	/**
	  * 返回农历y年闰月的天数 若该年没有闰月则返回0
	  * @param {number} y lunar Year
	  * @return Number (0、29、30)
	  * @eg:var leapMonthDay = leapDays(1987) ;//leapMonthDay=29
	  */
	leapDays(y) {
		if (this.leapMonth(y)) {
			return ((CONSTANT.lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
		}
		return (0);
	}

	/**
	  * 返回农历y年m月（非闰月）的总天数，计算m为闰月时的天数请使用leapDays方法
	  * @param {number} y lunar Year
	  * @param {number} m lunar Month
	  * @return Number (-1、29、30)
	  * @eg:var MonthDay = monthDays(1987,9) ;//MonthDay=29
	  */
	monthDays(y, m) {
		if (m > 12 || m < 1) { return -1 }//月份参数从1至12，参数错误返回-1
		return ((CONSTANT.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
	}

	/**
	  * 返回公历(!)y年m月的天数
	  * @param {number} y solar Year
	  * @param {number} m solar Month
	  * @return Number (-1、28、29、30、31)
	  * @eg:var solarMonthDay = solarDays(1987,9) ;//solarMonthDay=30
	  */
	solarDays(y, m) {
		if (m > 12 || m < 1) { return -1 } //若参数错误 返回-1
		let ms = m - 1;
		if (ms == 1) { //2月份的闰平规律测算后确认返回28或29
			return (((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)) ? 29 : 28);
		} else {
			return (CONSTANT.solarMonth[ms]);
		}
	}

	/**
	 * 农历年份转换为干支纪年
	 * @param {number} lYear 农历年的年份数
	 * @return Cn string
	 */
	toGanZhiYear(lYear) {
		let ganKey = (lYear - 3) % 10;
		let zhiKey = (lYear - 3) % 12;
		if (ganKey == 0) ganKey = 10;//如果余数为0则为最后一个天干
		if (zhiKey == 0) zhiKey = 12;//如果余数为0则为最后一个地支
		return CONSTANT.Gan[ganKey - 1] + CONSTANT.Zhi[zhiKey - 1];
	}
	/**
	 * 公历月、日判断所属星座
	 * @param {number} cMonth solar Month
	 * @param {number} cDay solar Day
	 * @return Cn string
	 */
	toAstro(cMonth, cDay) {
		let s = "\u9b54\u7faf\u6c34\u74f6\u53cc\u9c7c\u767d\u7f8a\u91d1\u725b\u53cc\u5b50\u5de8\u87f9\u72ee\u5b50\u5904\u5973\u5929\u79e4\u5929\u874e\u5c04\u624b\u9b54\u7faf";
		let arr = [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22];
		return s.substr(cMonth * 2 - (cDay < arr[cMonth - 1] ? 2 : 0), 2) + "\u5ea7";//座
	}

	/**
	  * 传入offset偏移量返回干支
	  * @param {number} offset 相对甲子的偏移量
	  * @return Cn string
	  */
	toGanZhi(offset) {
		return CONSTANT.Gan[offset % 10] + CONSTANT.Zhi[offset % 12];
	}

	/**
	  * 传入公历(!)y年获得该年第n个节气的公历日期
	  * @param {number} y 公历年(1900-2100)；
	  * @param {number} n 二十四节气中的第几个节气(1~24)；从n=1(小寒)算起 
	  * @return day Number
	  * @eg:var _24 = getTerm(1987,3) ;//_24=4;意即1987年2月4日立春
	  */
	getTerm(y, n) {
		if (y < 1900 || y > 2100) { return -1; }
		if (n < 1 || n > 24) { return -1; }
		let table = CONSTANT.sTermInfo[y - 1900];
		let info = [
			parseInt('0x' + table.substr(0, 5)).toString(),
			parseInt('0x' + table.substr(5, 5)).toString(),
			parseInt('0x' + table.substr(10, 5)).toString(),
			parseInt('0x' + table.substr(15, 5)).toString(),
			parseInt('0x' + table.substr(20, 5)).toString(),
			parseInt('0x' + table.substr(25, 5)).toString()
		];
		let calday = [
			info[0].substr(0, 1),
			info[0].substr(1, 2),
			info[0].substr(3, 1),
			info[0].substr(4, 2),

			info[1].substr(0, 1),
			info[1].substr(1, 2),
			info[1].substr(3, 1),
			info[1].substr(4, 2),

			info[2].substr(0, 1),
			info[2].substr(1, 2),
			info[2].substr(3, 1),
			info[2].substr(4, 2),

			info[3].substr(0, 1),
			info[3].substr(1, 2),
			info[3].substr(3, 1),
			info[3].substr(4, 2),

			info[4].substr(0, 1),
			info[4].substr(1, 2),
			info[4].substr(3, 1),
			info[4].substr(4, 2),

			info[5].substr(0, 1),
			info[5].substr(1, 2),
			info[5].substr(3, 1),
			info[5].substr(4, 2),
		];
		return parseInt(calday[n - 1]);
	}

	/**
	  * 传入农历数字月份返回汉语通俗表示法
	  * @param {number} m lunar month
	  * @return {string}Cn string
	  * @eg:var cnMonth = toChinaMonth(12) ;//cnMonth='腊月'
	  */
	toChinaMonth(m) { // 月 => \u6708
		if (m > 12 || m < 1) { return -1 } //若参数错误 返回-1
		let s = CONSTANT.nStr3[m - 1];
		s += "\u6708";//加上月字
		return s;
	}

	/**
	  * 传入农历日期数字返回汉字表示法
	  * @param {number} d lunar day
	  * @return Cn string
	  * @eg:var cnDay = toChinaDay(21) ;//cnMonth='廿一'
	  */
	toChinaDay(d) { //日 => \u65e5
		let s;
		switch (d) {
			case 10:
				s = '\u521d\u5341'; break;
			case 20:
				s = '\u4e8c\u5341'; break;
			case 30:
				s = '\u4e09\u5341'; break;
			default:
				s = CONSTANT.nStr2[Math.floor(d / 10)];
				s += CONSTANT.nStr1[d % 10];
		}
		return (s);
	}

	/**
	  * 年份转生肖[!仅能大致转换] => 精确划分生肖分界线是“立春”
	  * @param {number} y year
	  * @return Cn string
	  * @eg:var animal = getAnimal(1987) ;//animal='兔'
	  */
	getAnimal(y) {
		return CONSTANT.Animals[(y - 4) % 12]
	}

	/**
	  * 传入阳历年月日获得详细的公历、农历object信息 <=>JSON
	  * @param {number} y solar year
	  * @param {number} m solar month
	  * @param {number} d solar day
	  * @return JSON object
	  * @eg:console.log(solar2lunar(1987,11,01));
	  */
	solar2lunar(y, m, d) { //参数区间1900.1.31~2100.12.31
		let objDate;
		y = parseInt(y);
		m = parseInt(m);
		d = parseInt(d);
		//年份限定、上限
		if (y < 1900 || y > 2100) {
			return -1;// undefined转换为数字变为NaN
		}
		//公历传参最下限
		if (y == 1900 && m == 1 && d < 31) {
			return -1;
		}
		//未传参  获得当天
		if (!y) {
			objDate = new Date();
		} else {
			objDate = new Date(y, parseInt(m) - 1, d)
		}
		let i, leap = 0, temp = 0;
		//修正ymd参数
		y = objDate.getFullYear();
		m = objDate.getMonth() + 1;
		d = objDate.getDate();
		let offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0, 31)) / 86400000;
		for (i = 1900; i < 2101 && offset > 0; i++) {
			temp = this.lYearDays(i);
			offset -= temp;
		}
		if (offset < 0) {
			offset += temp; i--;
		}

		//是否今天
		let isTodayObj = new Date(),
			isToday = false;
		if (isTodayObj.getFullYear() == y && isTodayObj.getMonth() + 1 == m && isTodayObj.getDate() == d) {
			isToday = true;
		}
		//星期几
		let nWeek = objDate.getDay(),
			cWeek = CONSTANT.nStr1[nWeek];
		//数字表示周几顺应天朝周一开始的惯例
		if (nWeek == 0) {
			nWeek = 7;
		}
		//农历年
		let year = i;
		leap = this.leapMonth(i); //闰哪个月
		let isLeap = false;

		//效验闰月
		for (i = 1; i < 13 && offset > 0; i++) {
			//闰月
			if (leap > 0 && i == (leap + 1) && isLeap == false) {
				--i;
				isLeap = true; temp = this.leapDays(year); //计算农历闰月天数
			}
			else {
				temp = this.monthDays(year, i);//计算农历普通月天数
			}
			//解除闰月
			if (isLeap == true && i == (leap + 1)) { isLeap = false; }
			offset -= temp;
		}
		// 闰月导致数组下标重叠取反
		if (offset == 0 && leap > 0 && i == leap + 1) {
			if (isLeap) {
				isLeap = false;
			} else {
				isLeap = true; --i;
			}
		}
		if (offset < 0) {
			offset += temp; --i;
		}
		//农历月
		let month = i;
		//农历日
		let day = offset + 1;
		//天干地支处理
		let sm = m - 1;
		let gzY = this.toGanZhiYear(year);

		// 当月的两个节气
		// bugfix-2017-7-24 11:03:38 use lunar Year Param `y` Not `year`
		let firstNode = this.getTerm(y, (m * 2 - 1));//返回当月「节」为几日开始
		let secondNode = this.getTerm(y, (m * 2));//返回当月「节」为几日开始

		// 依据12节气修正干支月
		let gzM = this.toGanZhi((y - 1900) * 12 + m + 11);
		if (d >= firstNode) {
			gzM = this.toGanZhi((y - 1900) * 12 + m + 12);
		}

		//传入的日期的节气与否
		let isTerm = false;
		let Term = null;
		if (firstNode == d) {
			isTerm = true;
			Term = CONSTANT.solarTerm[m * 2 - 2];
		}
		if (secondNode == d) {
			isTerm = true;
			Term = CONSTANT.solarTerm[m * 2 - 1];
		}
		//日柱 当月一日与 1900/1/1 相差天数
		let dayCyclical = Date.UTC(y, sm, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;
		let gzD = this.toGanZhi(dayCyclical + d - 1);
		//该日期所属的星座
		let astro = this.toAstro(m, d);

		let solarDate = y + '-' + m + '-' + d;
		let lunarDate = year + '-' + month + '-' + day;

		let festival = CONSTANT.festival;
		let lfestival = CONSTANT.lfestival;

		let festivalDate = m + '-' + d;
		let lunarFestivalDate = month + '-' + day;

		return {
			date: solarDate,
			lunarDate: lunarDate,
			festival: festival[festivalDate] ? festival[festivalDate].title : null,
			lunarFestival: lfestival[lunarFestivalDate] ? lfestival[lunarFestivalDate].title : null,
			'lYear': year,
			'lMonth': month,
			'lDay': day,
			'Animal': this.getAnimal(year),
			'IMonthCn': (isLeap ? "\u95f0" : '') + this.toChinaMonth(month),
			'IDayCn': this.toChinaDay(day),
			'cYear': y,
			'cMonth': m,
			'cDay': d,
			'gzYear': gzY,
			'gzMonth': gzM,
			'gzDay': gzD,
			isToday,
			isLeap,
			nWeek,
			'ncWeek': "\u661f\u671f" + cWeek,
			isTerm,
			Term,
			astro
		};
	}

	/**
	  * 传入农历年月日以及传入的月份是否闰月获得详细的公历、农历object信息 <=>JSON
	  * @param {number} y lunar year
	  * @param {number} m lunar month
	  * @param {number} d lunar day
	  * @param {boolean} isLeapMonth lunar month is leap or not.[如果是农历闰月第四个参数赋值true即可]
	  * @return JSON object
	  * @eg:console.log(lunar2solar(1987,9,10));
	  */
	lunar2solar(y, m, d, isLeapMonth) {   //参数区间1900.1.31~2100.12.1
		y = parseInt(y);
		m = parseInt(m);
		d = parseInt(d);
		isLeapMonth = !!isLeapMonth;
		let leapOffset = 0;
		let leapMonth = this.leapMonth(y);
		let leapDay = this.leapDays(y);
		if (isLeapMonth && (leapMonth != m)) { return -1; }//传参要求计算该闰月公历 但该年得出的闰月与传参的月份并不同
		if (y == 2100 && m == 12 && d > 1 || y == 1900 && m == 1 && d < 31) { return -1; }//超出了最大极限值 
		let day = this.monthDays(y, m);
		let _day = day;
		//bugFix 2016-9-25 
		//if month is leap, _day use leapDays method 
		if (isLeapMonth) {
			_day = this.leapDays(y, m);
		}
		if (y < 1900 || y > 2100 || d > _day) { return -1; }//参数合法性效验

		//计算农历的时间差
		let offset = 0;
		for (let i = 1900; i < y; i++) {
			offset += this.lYearDays(i);
		}
		let leap = 0, isAdd = false;
		for (let i = 1; i < m; i++) {
			leap = this.leapMonth(y);
			if (!isAdd) {//处理闰月
				if (leap <= i && leap > 0) {
					offset += this.leapDays(y); isAdd = true;
				}
			}
			offset += this.monthDays(y, i);
		}
		//转换闰月农历 需补充该年闰月的前一个月的时差
		if (isLeapMonth) { offset += day; }
		//1900年农历正月一日的公历时间为1900年1月30日0时0分0秒(该时间也是本农历的最开始起始点)
		let stmap = Date.UTC(1900, 1, 30, 0, 0, 0);
		let calObj = new Date((offset + d - 31) * 86400000 + stmap);
		let cY = calObj.getUTCFullYear();
		let cM = calObj.getUTCMonth() + 1;
		let cD = calObj.getUTCDate();

		return this.solar2lunar(cY, cM, cD);
	}
}

module.exports = Calendar;
