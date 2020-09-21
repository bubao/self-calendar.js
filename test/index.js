/**
 * @description: 
 * @author: bubao
 * @date: 2020-09-21 18:55:43
 * @last author: bubao
 * @last edit time: 2020-09-21 19:52:34
 */
const Calendar = require("..")

const cal = new Calendar()

console.log(cal.getAnimal(2020))

console.log(cal.getTerm(2020, 3))

console.log(cal.lYearDays(2020))

console.log(cal.leapDays(2020))

console.log(cal.leapMonth(2020))

console.log(cal.lunar2solar(2020, 9, 21))

console.log(cal.monthDays(2020, 9))

console.log(cal.solarDays(2020, 9))

console.log(cal.toAstro(9, 21))

console.log(cal.toChinaDay(21))

console.log(cal.toChinaMonth(12))
