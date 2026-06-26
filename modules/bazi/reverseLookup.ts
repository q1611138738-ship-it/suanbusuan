import { Lunar, Solar } from 'lunar-javascript';

export interface ReverseLookupResult {
  solarDate: string; // YYYY-MM-DD
  solarTime?: string; // HH:mm
  lunarString: string; // e.g. "1924年九月十四 00:00:00"
}

export function reverseLookupBaZi(
  yearGanZhi: string,
  monthGanZhi: string,
  dayGanZhi: string,
  timeGanZhi: string, // empty string if timeUnknown
  startYear = 1801,
  endYear = 2099
): ReverseLookupResult[] {
  const results: ReverseLookupResult[] = [];

  for (let y = startYear; y <= endYear; y++) {
    // 粗筛年份: 年柱干支每60年一轮回。立春一般在公历2月初，所以农历的年干支可能对应公历的 y, y-1 或 y+1
    // Lunar.fromYmd(y, 1, 1).getYearInGanZhiExact() 可以取得近似的年柱干支进行粗筛
    const lY1 = Lunar.fromYmd(y - 1, 1, 1).getYearInGanZhiExact();
    const lY2 = Lunar.fromYmd(y, 1, 1).getYearInGanZhiExact();
    const lY3 = Lunar.fromYmd(y + 1, 1, 1).getYearInGanZhiExact();

    if (lY1 === yearGanZhi || lY2 === yearGanZhi || lY3 === yearGanZhi) {
      // 找到可能的年份，从上一年的 12 月开始逐日排查，查满 400 天覆盖各种提前/延后的立春
      let currentSolar = Solar.fromYmd(y - 1, 12, 1);
      
      for (let d = 0; d < 400; d++) {
        // 先按中午 12:00 排查日柱（规避早晚子时对日柱的干扰）
        const testSolar = Solar.fromYmdHms(
          currentSolar.getYear(),
          currentSolar.getMonth(),
          currentSolar.getDay(),
          12, 0, 0
        );
        const baziDay = testSolar.getLunar().getEightChar();
        baziDay.setSect(2); // 保持和 computeChart 一致的早晚子时约定

        // 匹配前三柱
        if (
          baziDay.getYear() === yearGanZhi &&
          baziDay.getMonth() === monthGanZhi &&
          baziDay.getDay() === dayGanZhi
        ) {
          if (!timeGanZhi) {
            // 时间未知：直接作为候选
            const lunarObj = testSolar.getLunar();
            results.push({
              solarDate: testSolar.toYmd(),
              lunarString: `${lunarObj.getYear()}年${lunarObj.getMonthInChinese()}月${lunarObj.getDayInChinese()} 12:00:00`
            });
          } else {
            // 有时柱：遍历12个时辰（步进2小时，从 0 开始）
            // 注意：子时横跨 23:00~01:00，sect=2 下，23:00属于晚子时（日柱不变，时柱为明日子时），00:00属于早子时（日柱进一天，时柱为明日子时）
            for (let h = 0; h < 24; h += 2) {
              // 处理早晚子时，测试该日期的这个小时
              const exactSolar = Solar.fromYmdHms(
                testSolar.getYear(),
                testSolar.getMonth(),
                testSolar.getDay(),
                h === 0 ? 0 : h,
                0,
                0
              );
              
              const baziHour = exactSolar.getLunar().getEightChar();
              baziHour.setSect(2);

              // 必须严格校验此时刻的四柱全部匹配（因为跨日可能导致日柱在晚子时/早子时发生预期外的偏移，必须完全符合用户输入的 4 柱）
              if (
                baziHour.getYear() === yearGanZhi &&
                baziHour.getMonth() === monthGanZhi &&
                baziHour.getDay() === dayGanZhi &&
                baziHour.getTime() === timeGanZhi
              ) {
                const lunarObj = exactSolar.getLunar();
                const timeStr = (h === 0 ? '00' : h < 10 ? '0' + h : h) + ':00:00';
                const timeShort = (h === 0 ? '00' : h < 10 ? '0' + h : h) + ':00';
                results.push({
                  solarDate: exactSolar.toYmd(),
                  solarTime: timeShort,
                  lunarString: `${lunarObj.getYear()}年${lunarObj.getMonthInChinese()}月${lunarObj.getDayInChinese()} ${timeStr}`
                });
                break; // 每天最多一个时辰匹配
              }
            }
          }
        }
        
        // 天数 +1
        currentSolar = currentSolar.next(1);
      }
    }
  }

  // 去重 (由于400天的重叠，加上 y 可能会被重复检查)
  const uniqueKeys = new Set<string>();
  const finalResults: ReverseLookupResult[] = [];
  for (const r of results) {
    const key = r.solarDate + '|' + (r.solarTime || '');
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      finalResults.push(r);
    }
  }

  return finalResults;
}
