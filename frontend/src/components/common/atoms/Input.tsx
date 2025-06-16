import { type InputHTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem; /* 12px 16px */
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  color: #495057;
  transition:
    border-color 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;

  &:focus {
    border-color: #007aff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    outline: none;
  }
`;

const Input = forwardRef<
  // TODO: Remove eslint-disable-next-line after refactoring
  // eslint-disable-next-line no-undef
  HTMLInputElement,
  // eslint-disable-next-line no-undef
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <StyledInput {...props} ref={ref} />);

Input.displayName = 'Input'; // React DevToolsでの表示名

export default Input;
