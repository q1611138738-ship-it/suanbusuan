import { expect, test, describe } from 'vitest';
import { buildQimenChart } from '../engine';

describe('Qimen Golden Standard Regression Tests (Strict Fields)', () => {
  function assertPalace(chart: any, gongNumber: number, expectedStr: string) {
    const p = chart.palaces.find((x: any) => x.gongNumber === gongNumber);
    expect(p).toBeDefined();
    
    // Format: "八神/天盘星/八门/天盘干/地盘干/旺相[/空][/马]"
    const parts = expectedStr.split('/');
    const expShen = parts[0];
    const expXing = parts[1];
    const expMen = parts[2];
    const expTianGan = parts[3];
    const expDiGan = parts[4];
    const expWang = parts[5];
    const expKong = parts.includes('空');
    const expMa = parts.includes('马');

    expect(p.divinity || '—').toBe(expShen);

    // Some cases use "天芮·天禽", we translate the array to that string format for testing
    let actualXing = p.heavenStar.join('·');
    if (!actualXing) actualXing = '—';
    // User expects "天芮·天禽" instead of "天芮星·天禽星" sometimes?
    // Wait, the engine outputs "天芮星", "天禽星". Let's handle it strictly.
    actualXing = actualXing.replace(/星/g, ''); 
    // Wait, if we replace 星, "天芮·天禽" is matching "天芮·天禽". But for single stars: "天心" instead of "天心星".
    // Let's see user format: "天柱星", "天芮·天禽". It is inconsistent.
    // I will replace the engine's array `["天芮星", "天禽星"]` to "天芮·天禽".
    // For single it's `["天柱星"]` -> "天柱星"
    if (p.heavenStar.length === 2 && p.heavenStar[0] === '天芮星' && p.heavenStar[1] === '天禽星') {
      actualXing = '天芮·天禽';
    } else {
      actualXing = p.heavenStar.join('·') || '—';
    }

    expect(actualXing).toBe(expXing);
    expect(p.door || '—').toBe(expMen);
    expect(p.heavenStems.join('') || '—').toBe(expTianGan);
    expect(p.earthStems.join('') || '—').toBe(expDiGan);
    expect(p.starVitality || '—').toBe(expWang);
    expect(p.isKongWang).toBe(expKong);
    expect(p.isYiMa).toBe(expMa);
  }

  test('Case 1: 2026-06-24T14:03:52+08:00 (夏至, 阴三局)', () => {
    const d = new Date('2026-06-24T14:03:52+08:00');
    const chart = buildQimenChart(d);

    expect(chart.fourPillars.year.ganzhi).toBe('丙午');
    expect(chart.fourPillars.month.ganzhi).toBe('甲午');
    expect(chart.fourPillars.day.ganzhi).toBe('己巳');
    expect(chart.fourPillars.hour.ganzhi).toBe('辛未');
    expect(chart.solarTerm).toBe('夏至');
    expect(chart.ju.label).toBe('阴遁三局');
    
    expect(chart.zhiFu.star).toBe('天冲星');
    expect(chart.zhiFu.gong).toBe('离9');
    
    expect(chart.zhiShi.door).toBe('伤门');
    expect(chart.zhiShi.gong).toBe('坤2');
    
    expect(chart.kongWang).toEqual(expect.arrayContaining(['戌', '亥']));
    expect(chart.yiMa).toBe('巳');

    assertPalace(chart, 1, '白虎/天柱星/死门/癸/庚/死');
    assertPalace(chart, 2, '九天/天辅星/伤门/乙/己/休');
    assertPalace(chart, 3, '太阴/天蓬星/开门/庚/戊/囚');
    assertPalace(chart, 4, '螣蛇/天任星/休门/壬/乙/相/马');
    assertPalace(chart, 5, '—/—/—/—/丙/—');
    assertPalace(chart, 6, '玄武/天芮·天禽/景门/己丙/丁/相/空');
    assertPalace(chart, 7, '九地/天英星/杜门/辛/癸/旺');
    assertPalace(chart, 8, '六合/天心星/惊门/丁/壬/死');
    assertPalace(chart, 9, '值符/天冲星/生门/戊/辛/休');
  });

  test('Case 2: 2024-06-20T14:30:00+08:00 (芒种, 阳三局)', () => {
    const d = new Date('2024-06-20T14:30:00+08:00');
    const chart = buildQimenChart(d);

    expect(chart.fourPillars.year.ganzhi).toBe('甲辰');
    expect(chart.fourPillars.month.ganzhi).toBe('庚午');
    expect(chart.fourPillars.day.ganzhi).toBe('乙卯');
    expect(chart.fourPillars.hour.ganzhi).toBe('癸未');
    expect(chart.solarTerm).toBe('芒种');
    expect(chart.ju.label).toBe('阳遁三局');
    
    expect(chart.zhiFu.star).toBe('天辅星');
    expect(chart.zhiFu.gong).toBe('艮8');
    
    expect(chart.zhiShi.door).toBe('杜门');
    expect(chart.zhiShi.gong).toBe('巽4');
    
    expect(chart.kongWang).toEqual(expect.arrayContaining(['申', '酉']));
    expect(chart.yiMa).toBe('巳');

    assertPalace(chart, 1, '九天/天冲星/休门/戊/丙/休');
    assertPalace(chart, 2, '白虎/天心星/死门/辛/乙/死/空');
    assertPalace(chart, 3, '螣蛇/天英星/伤门/丁/戊/旺');
    assertPalace(chart, 4, '太阴/天芮·天禽/杜门/乙庚/己/相/马');
    assertPalace(chart, 5, '—/—/—/—/庚/—');
    assertPalace(chart, 6, '九地/天任星/开门/癸/辛/相');
    assertPalace(chart, 7, '玄武/天蓬星/惊门/丙/壬/囚/空');
    assertPalace(chart, 8, '值符/天辅星/生门/己/癸/休');
    assertPalace(chart, 9, '六合/天柱星/景门/壬/丁/死');
  });

  test('Case 3: 2023-08-08T08:00:00+08:00 (立秋, 阴二局)', () => {
    const d = new Date('2023-08-08T08:00:00+08:00');
    const chart = buildQimenChart(d);

    expect(chart.fourPillars.year.ganzhi).toBe('癸卯');
    expect(chart.fourPillars.month.ganzhi).toBe('庚申');
    expect(chart.fourPillars.day.ganzhi).toBe('戊戌');
    expect(chart.fourPillars.hour.ganzhi).toBe('丙辰');
    expect(chart.solarTerm).toBe('立秋');
    expect(chart.ju.label).toBe('阴遁二局');
    
    expect(chart.zhiFu.star).toBe('天心星');
    expect(chart.zhiFu.gong).toBe('巽4');
    
    expect(chart.zhiShi.door).toBe('开门');
    expect(chart.zhiShi.gong).toBe('巽4');
    
    expect(chart.kongWang).toEqual(expect.arrayContaining(['子', '丑']));
    expect(chart.yiMa).toBe('寅');

    assertPalace(chart, 1, '六合/天英星/景门/庚/己/囚/空');
    assertPalace(chart, 2, '九地/天任星/生门/辛/戊/休');
    assertPalace(chart, 3, '螣蛇/天柱星/惊门/壬/乙/旺');
    assertPalace(chart, 4, '值符/天心星/开门/癸/丙/旺');
    assertPalace(chart, 5, '—/—/—/—/丁/—');
    assertPalace(chart, 6, '白虎/天辅星/杜门/丙/癸/死');
    assertPalace(chart, 7, '玄武/天冲星/伤门/乙/壬/死');
    assertPalace(chart, 8, '太阴/天芮·天禽/死门/戊丁/辛/休/空/马');
    assertPalace(chart, 9, '九天/天蓬星/休门/己/庚/相');
  });
});
