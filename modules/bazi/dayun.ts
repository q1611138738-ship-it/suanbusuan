import { Solar } from 'lunar-javascript';

export function getPreciseDaYun(baseDate: Date, genderCode: number, baZi: any) {
  const s = Solar.fromYmdHms(
    baseDate.getFullYear(),
    baseDate.getMonth() + 1,
    baseDate.getDate(),
    baseDate.getHours(),
    baseDate.getMinutes(),
    baseDate.getSeconds()
  );
  
  // genderCode: 1 = male, 0 = female
  const isYangYear = ['甲', '丙', '戊', '庚', '壬'].includes(baZi.getYearGan());
  const isForward = (genderCode === 1 && isYangYear) || (genderCode === 0 && !isYangYear);

  const targetJieQi = isForward ? s.getLunar().getNextJieQi(true) : s.getLunar().getPrevJieQi(true);
  const targetSolar = targetJieQi.getSolar();
  
  const targetDate = new Date(
    targetSolar.getYear(),
    targetSolar.getMonth() - 1,
    targetSolar.getDay(),
    targetSolar.getHour(),
    targetSolar.getMinute(),
    targetSolar.getSecond()
  );

  const diffMs = Math.abs(targetDate.getTime() - baseDate.getTime());
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // Wenzhen Precise rules (精算):
  // 3 days diff = 1 year of life (360 days)
  // 1 day diff = 4 months = 120 days of life
  // 1 hour diff = 5 days of life
  // 1 minute diff = 2 hours of life
  
  const lifeHours = diffMinutes * 2;
  
  const years = Math.floor(lifeHours / (360 * 24));
  const rem1 = lifeHours % (360 * 24);
  const months = Math.floor(rem1 / (30 * 24));
  const rem2 = rem1 % (30 * 24);
  const days = Math.floor(rem2 / 24);
  const hours = rem2 % 24;

  // Calculate actual intersection Date
  const startDate = new Date(baseDate.getTime());
  startDate.setFullYear(startDate.getFullYear() + years);
  startDate.setMonth(startDate.getMonth() + months);
  startDate.setDate(startDate.getDate() + days);
  startDate.setHours(startDate.getHours() + hours);

  return { 
    years, 
    months, 
    days, 
    hours, 
    diffMinutes,
    isForward,
    startDesc: `出生后${years}年${months}月${days}天${hours}时起运`,
    startDate: startDate.toISOString()
  };
}
