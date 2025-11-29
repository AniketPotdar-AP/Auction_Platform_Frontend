import React from 'react';
import { InputText } from 'primereact/inputtext';

interface CustomInputProps {
    id?: string;
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    type?: string;
    min?: string;
    step?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
    id,
    name,
    value,
    onChange,
    placeholder,
    required,
    className = '',
    type = 'text',
    min,
    step
}) => {
    return (
        <InputText
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            type={type}
            className={`w-full ${className}`}
            min={min}
            step={step}
        />
    );
};

export default CustomInput;
