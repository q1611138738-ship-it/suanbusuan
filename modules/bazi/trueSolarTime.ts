/**
 * 真太阳时补偿算法
 * 钟表时间 -> 真太阳时
 */

// 获取一年中的第几天
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime() + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// 均时差近似计算 (Equation of Time)，返回分钟数
export function getEquationOfTime(date: Date): number {
  const n = getDayOfYear(date);
  const B = (2 * Math.PI * (n - 81)) / 365;
  // 经典傅里叶级数近似展开，单位：分钟
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  return eot;
}

/**
 * 将标准时间转换为真太阳时
 * @param date 标准时间
 * @param longitude 经度（如 120）
 * @returns 经过真太阳时调整后的新 Date 对象
 */
export function getTrueSolarTime(date: Date, longitude: number): Date {
  // 经度时差 = (当地经度 - 所在时区中央经线) * 4 分钟
  // 中国统一使用东八区(120度)作为标准时
  const longitudeOffsetMinutes = (longitude - 120) * 4;
  
  // 均时差
  const eotMinutes = getEquationOfTime(date);
  
  // 总时间补偿（毫秒）
  const totalOffsetMs = (longitudeOffsetMinutes + eotMinutes) * 60 * 1000;
  
  return new Date(date.getTime() + totalOffsetMs);
}
