import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CHINA_REGIONS } from '@/config/china-regions';

interface LocationValue {
  country: string;
  province?: string;
  city?: string;
  district?: string;
  town?: string;
  longitude?: number;
  latitude?: number;
  source: 'cascade' | 'city-search' | 'manual';
}

interface LocationCascadeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  onChange: (val: LocationValue) => void;
  required?: boolean;
  disabled?: boolean;
}



export function LocationCascade({ value, onChange, required, disabled }: LocationCascadeProps) {
  const [country, setCountry] = useState<string>(() => value?.country || '中国');
  
  // Cascade state
  const [province, setProvince] = useState<string>(() => value?.country === '中国' ? value?.province || '' : '');
  const [city, setCity] = useState<string>(() => value?.country === '中国' ? value?.city || '' : '');
  const [district, setDistrict] = useState<string>(() => value?.country === '中国' ? value?.district || '' : '');
  const [town, setTown] = useState<string>(() => value?.country === '中国' ? value?.town || '' : '');

  // Other countries state
  const [foreignCity, setForeignCity] = useState<string>(() => value?.country !== '中国' ? value?.city || '' : '');
  const [longitudeStr, setLongitudeStr] = useState<string>(() => value?.longitude !== undefined ? value.longitude.toString() : '');
  const [isFetchingLon, setIsFetchingLon] = useState(false);

  const handleCountryChange = (c: string) => {
    setCountry(c);
    if (c === '中国') {
      onChange({
        country: '中国',
        province, city, district, town,
        source: 'cascade'
      });
    } else {
      onChange({
        country: c,
        city: foreignCity,
        longitude: longitudeStr && !isNaN(parseFloat(longitudeStr)) ? parseFloat(longitudeStr) : undefined,
        source: 'manual'
      });
    }
  };

  const handleCascadeChange = (key: 'province' | 'city' | 'district' | 'town', val: string) => {
    let p = province;
    let c = city;
    let d = district;
    let t = town;

    if (key === 'province') { p = val; c = ''; d = ''; t = ''; setProvince(p); setCity(''); setDistrict(''); setTown(''); }
    if (key === 'city') { c = val; d = ''; t = ''; setCity(c); setDistrict(''); setTown(''); }
    if (key === 'district') { d = val; t = ''; setDistrict(d); setTown(''); }
    if (key === 'town') { t = val; setTown(t); }

    let fetchedLonStr = longitudeStr;

    // Fetch longitude from nominatim if we have at least city
    if (key === 'city' || key === 'district') {
      const searchTarget = key === 'city' ? c : (d || c);
      if (searchTarget) {
        setIsFetchingLon(true);
        const query = `${p}${c}${d}`;
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
          headers: { 'User-Agent': 'suanbusuan-app/1.0' }
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0 && data[0].lon) {
              fetchedLonStr = parseFloat(data[0].lon).toFixed(4);
              setLongitudeStr(fetchedLonStr);
              // Trigger a secondary onChange with the new longitude
              onChange({
                country: '中国',
                province: p,
                city: c,
                district: d,
                town: t,
                longitude: parseFloat(fetchedLonStr),
                source: 'cascade'
              });
            }
          })
          .finally(() => {
            setIsFetchingLon(false);
          });
      }
    }

    onChange({
      country: '中国',
      province: p,
      city: c,
      district: d,
      town: t,
      longitude: fetchedLonStr && !isNaN(parseFloat(fetchedLonStr)) ? parseFloat(fetchedLonStr) : undefined,
      source: 'cascade'
    });
  };

  const handleForeignChange = (key: 'city' | 'lon', val: string) => {
    let fc = foreignCity;
    let ls = longitudeStr;

    if (key === 'city') { fc = val; setForeignCity(fc); }
    if (key === 'lon') { ls = val; setLongitudeStr(ls); }

    onChange({
      country: country,
      city: fc,
      longitude: ls && !isNaN(parseFloat(ls)) ? parseFloat(ls) : undefined,
      source: 'manual'
    });
  };

  const handleForeignBlur = () => {
    if (foreignCity && foreignCity.trim() && !longitudeStr) {
      setIsFetchingLon(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(foreignCity.trim())}`, {
        headers: { 'User-Agent': 'suanbusuan-app/1.0' }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0 && data[0].lon) {
            const fetchedLonStr = parseFloat(data[0].lon).toFixed(4);
            setLongitudeStr(fetchedLonStr);
            onChange({
              country,
              city: foreignCity,
              longitude: parseFloat(fetchedLonStr),
              source: 'manual'
            });
          }
        })
        .catch(() => { /* Ignore errors */ })
        .finally(() => {
          setIsFetchingLon(false);
        });
    }
  };

  const provinces = Object.keys(CHINA_REGIONS);
  const cities = province ? Object.keys(CHINA_REGIONS[province] || {}) : [];
  const districts = province && city ? (CHINA_REGIONS[province]?.[city] || []) : [];
  const towns: string[] = []; // Town data is omitted for brevity to save bundle size in Phase 0

  return (
    <div className="flex flex-col gap-3 w-full">
      <Select value={String(country ?? "")} onValueChange={(v) => { if (v) handleCountryChange(v) }} required={required} disabled={disabled}>
        <SelectTrigger className="h-12 rounded-xl w-full">
          <SelectValue placeholder="国家" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="中国">中国</SelectItem>
          <SelectItem value="其他国家">其他国家</SelectItem>
        </SelectContent>
      </Select>

      {country === '中国' && (
        <div className="grid grid-cols-2 gap-3">
          <Select value={String(province ?? "")} onValueChange={(v) => { if (v) handleCascadeChange('province', v) }} required={required} disabled={disabled}>
            <SelectTrigger className="h-12 rounded-xl w-full"><SelectValue placeholder="省/直辖市" /></SelectTrigger>
            <SelectContent>
              {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={String(city ?? "")} onValueChange={(v) => { if (v) handleCascadeChange('city', v) }} required={required} disabled={disabled || !province}>
            <SelectTrigger className="h-12 rounded-xl w-full"><SelectValue placeholder="市" /></SelectTrigger>
            <SelectContent>
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={String(district ?? "")} onValueChange={(v) => { if (v) handleCascadeChange('district', v) }} disabled={disabled || !city}>
            <SelectTrigger className="h-12 rounded-xl w-full"><SelectValue placeholder="区/县 (选填)" /></SelectTrigger>
            <SelectContent>
              {districts.length > 0 ? districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>) : <SelectItem value="none" disabled>暂无数据</SelectItem>}
            </SelectContent>
          </Select>

          <Select value={String(town ?? "")} onValueChange={(v) => { if (v) handleCascadeChange('town', v) }} disabled={disabled || !district}>
            <SelectTrigger className="h-12 rounded-xl w-full"><SelectValue placeholder="镇/街道 (选填)" /></SelectTrigger>
            <SelectContent>
              {towns.length > 0 ? towns.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>) : <SelectItem value="none" disabled>暂无数据</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 补充经度显示，支持中国和其他国家 */}
      {(country === '中国' && province && city) || country !== '中国' ? (
        <div className="flex flex-col gap-3">
          {country !== '中国' && (
            <Input 
              placeholder="城市 (例如: Los Angeles / Tokyo)" 
              value={foreignCity}
              onChange={(e) => handleForeignChange('city', e.target.value)}
              onBlur={handleForeignBlur}
              required={required}
              disabled={disabled}
              className="h-12 rounded-xl w-full"
            />
          )}
          <div className="relative w-full">
            <Input 
              placeholder="经度 (影响真太阳时，如: 121.5000)" 
              value={longitudeStr}
              onChange={(e) => {
                setLongitudeStr(e.target.value);
                if (country === '中国') {
                  onChange({ country: '中国', province, city, district, town, longitude: e.target.value && !isNaN(parseFloat(e.target.value)) ? parseFloat(e.target.value) : undefined, source: 'cascade' });
                } else {
                  handleForeignChange('lon', e.target.value);
                }
              }}
              type="number"
              step="0.0001"
              required={required}
              disabled={disabled}
              className="h-12 rounded-xl w-full pr-24"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
              {isFetchingLon ? '获取中...' : '真太阳时校准'}
            </div>
          </div>
        </div>
      ) : null}

      {/* 仅在国家不是中国且没选省市时兜底显示（理论上走不到这） */}
      {country !== '中国' && !foreignCity && !longitudeStr && (
        <div className="flex flex-col gap-3">
           <Input 
            placeholder="城市 (例如: Los Angeles / Tokyo)" 
            value={foreignCity}
            onChange={(e) => handleForeignChange('city', e.target.value)}
            onBlur={handleForeignBlur}
            required={required}
            disabled={disabled}
            className="h-12 rounded-xl w-full"
          />
        </div>
      )}
    </div>
  );
}
