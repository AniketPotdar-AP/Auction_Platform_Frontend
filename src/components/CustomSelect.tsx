import React from 'react';
import { Dropdown } from 'primereact/dropdown';

interface CustomSelectProps {
    id?: string;
    name?: string;
    value?: any;
    options?: any[];
    onChange?: (e: any) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    id,
    name,
    value,
    options,
    onChange,
    placeholder,
    required,
    className = ''
}) => {
    return (
        <Dropdown
            id={id}
            name={name}
            value={value}
            options={options}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`w-full ${className}`}
        />
    );
};

export default CustomSelect;