import React, { type ReactNode } from 'react';
import styled from 'styled-components';

const FormGroupWrapper = styled.div`
  margin-bottom: 1.5rem; /* 24px */
`;

const Label = styled.label`
  display: block;
  font-size: 0.9375rem; /* 15px */
  font-weight: 500;
  color: #343a40;
  margin-bottom: 0.5rem; /* 8px */
`;

const ErrorMessage = styled.p`
  font-size: 0.875rem; /* 14px */
  color: #dc3545; /* Danger color */
  margin-top: 0.5rem; /* 8px */
`;

interface FormGroupProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  error?: string;
}

const FormGroup: React.FC<FormGroupProps> = ({
  label,
  htmlFor,
  children,
  error,
}) => (
  <FormGroupWrapper>
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {error && <ErrorMessage>{error}</ErrorMessage>}
  </FormGroupWrapper>
);

export default FormGroup;
