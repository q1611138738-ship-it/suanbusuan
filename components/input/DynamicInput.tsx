import { InputField } from '@/types/module';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateSelect } from './DateSelect';
import { TimeSelect24h } from './TimeSelect24h';
import { LocationCascade } from './LocationCascade';

interface DynamicInputProps {
  schema: InputField;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (val: any) => void;
  disabled?: boolean;
}

export function DynamicInput({ schema, value, onChange, disabled }: DynamicInputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label htmlFor={schema.id} className="text-stone-700 dark:text-stone-300 font-medium pl-1">
        {schema.label}
        {schema.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {schema.type === 'date' && (
        <Input 
          id={schema.id}
          type="date" 
          required={schema.required}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-12 rounded-xl"
        />
      )}
      
      {schema.type === 'time' && (
        <Input 
          id={schema.id}
          type="time" 
          required={schema.required}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-12 rounded-xl"
        />
      )}

      {schema.type === 'text' && (
        <Input 
          id={schema.id}
          type="text" 
          placeholder={schema.placeholder}
          required={schema.required}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-12 rounded-xl"
        />
      )}

      {schema.type === 'select' && schema.options && (
        <Select value={String(value ?? "")} onValueChange={onChange} required={schema.required} disabled={disabled}>
          <SelectTrigger className="h-12 rounded-xl w-full">
            <SelectValue placeholder={schema.placeholder || "请选择"} />
          </SelectTrigger>
          <SelectContent>
            {schema.options.map(opt => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {schema.type === 'date-select' && (
        <DateSelect value={value} onChange={onChange} required={schema.required} disabled={disabled} />
      )}

      {schema.type === 'time-select-24h' && (
        <TimeSelect24h value={value} onChange={onChange} required={schema.required} unknownTimeLabel={schema.unknownTimeLabel} disabled={disabled} />
      )}

      {schema.type === 'location-cascade' && (
        <LocationCascade value={value} onChange={onChange} required={schema.required} disabled={disabled} />
      )}
    </div>
  );
}
