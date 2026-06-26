import { describe, it, expect } from 'vitest';
import { computeChart } from '../computeChart';

describe('computeChart', () => {
  it('1. 普通命例 - 甲辰年正月初一中午', () => {
    // 2024-02-10 12:00:00
    // 甲辰年 丙寅月 甲辰日 庚午时
    const input = {
      solarDatetime: '2024-02-10T12:00:00',
      gender: 'male',
      timeKnown: true
    };
    const chart = computeChart(input);
    expect(chart.pillars.year).toEqual({ gan: '甲', zhi: '辰' });
    expect(chart.pillars.month).toEqual({ gan: '丙', zhi: '寅' });
    expect(chart.pillars.day).toEqual({ gan: '甲', zhi: '辰' });
    expect(chart.pillars.hour).toEqual({ gan: '庚', zhi: '午' });
  });

  it('2. 立春前生人 (2024年立春在2月4日16:26)', () => {
    // 2024-02-04 12:00:00 (立春前)
    // 癸卯年 乙丑月 戊戌日 戊午时
    const input = {
      solarDatetime: '2024-02-04T12:00:00',
      gender: 'male',
      timeKnown: true
    };
    const chart = computeChart(input);
    expect(chart.pillars.year).toEqual({ gan: '癸', zhi: '卯' });
    expect(chart.pillars.month).toEqual({ gan: '乙', zhi: '丑' });
  });

  it('3. 节气交接日后 (立春后)', () => {
    // 2024-02-04 17:00:00 (立春后)
    // 甲辰年 丙寅月 戊戌日 辛酉时
    const input = {
      solarDatetime: '2024-02-04T17:00:00',
      gender: 'male',
      timeKnown: true
    };
    const chart = computeChart(input);
    expect(chart.pillars.year).toEqual({ gan: '甲', zhi: '辰' });
    expect(chart.pillars.month).toEqual({ gan: '丙', zhi: '寅' });
  });

  it('4. 晚子时 - 23:30 日柱归当日', () => {
    // 2024-02-10 23:30:00
    // 甲辰日 23:30。日柱应该还是甲辰，时柱是甲子
    const input = {
      solarDatetime: '2024-02-10T23:30:00',
      gender: 'male',
      timeKnown: true
    };
    const chart = computeChart(input);
    expect(chart.pillars.day).toEqual({ gan: '甲', zhi: '辰' });
    expect(chart.pillars.hour.zhi).toEqual('子');
    // 晚子时，时柱采用次日（乙日）的时干推算，乙庚丙作初，所以是丙子
    expect(chart.pillars.hour.gan).toEqual('丙');
  });

  it('5. 早子时 - 00:30 日柱归次日', () => {
    // 2024-02-11 00:30:00
    // 这是第二天，日柱是乙巳，早子时应该是丙子
    const input = {
      solarDatetime: '2024-02-11T00:30:00',
      gender: 'male',
      timeKnown: true
    };
    const chart = computeChart(input);
    expect(chart.pillars.day).toEqual({ gan: '乙', zhi: '巳' });
    expect(chart.pillars.hour.zhi).toEqual('子');
    // 乙庚丙作初，所以乙日的子时是丙子
    expect(chart.pillars.hour.gan).toEqual('丙');
  });

  it('6. 闰月用例 - 不受农历闰月影响', () => {
    // 2023年闰二月。我们在2023-04-15测试
    // 农历是闰二月廿五。
    // 此时已经过了清明(4月5日)，应当是丙辰月。
    const input = {
      solarDatetime: '2023-04-15T12:00:00',
      gender: 'female',
      timeKnown: true
    };
    const chart = computeChart(input);
    expect(chart.pillars.year).toEqual({ gan: '癸', zhi: '卯' });
    expect(chart.pillars.month).toEqual({ gan: '丙', zhi: '辰' });
  });

  it('7. 真太阳时校正 - 经度导致时柱变化', () => {
    // 2024-02-10 11:20:00 (东八区标准时间)
    // 根据均时差计算，2月中旬均时差为负14分钟左右。
    // 在120度经度，真太阳时约 11:06，属于午时。
    const input120 = {
      solarDatetime: '2024-02-10T11:20:00',
      gender: 'male',
      longitude: 120,
      timeKnown: true
    };
    const chart120 = computeChart(input120);
    expect(chart120.pillars.hour.zhi).toEqual('午');

    // 在东经 100 度，比 120 度慢 80 分钟。
    // 真太阳时大概是 09:46 左右，属于巳时。
    const input100 = {
      solarDatetime: '2024-02-10T11:20:00',
      gender: 'male',
      longitude: 100,
      timeKnown: true
    };
    const chart100 = computeChart(input100);
    expect(chart100.pillars.hour.zhi).toEqual('巳');
  });

  it('8. 大运顺逆与起运 - 阳年男顺排，阴年男逆排', () => {
    // 阳年男 (甲辰) -> 顺排
    const maleYang = computeChart({
      solarDatetime: '2024-02-10T12:00:00', // 甲辰年 (阳)
      gender: 'male',
      timeKnown: true
    });
    expect(maleYang.luck.forward).toBe(true);

    // 阴年男 (癸卯) -> 逆排
    const maleYin = computeChart({
      solarDatetime: '2023-04-15T12:00:00', // 癸卯年 (阴)
      gender: 'male',
      timeKnown: true
    });
    expect(maleYin.luck.forward).toBe(false);

    // 阳年女 (甲辰) -> 逆排
    const femaleYang = computeChart({
      solarDatetime: '2024-02-10T12:00:00', // 甲辰年 (阳)
      gender: 'female',
      timeKnown: true
    });
    expect(femaleYang.luck.forward).toBe(false);
  });
});
