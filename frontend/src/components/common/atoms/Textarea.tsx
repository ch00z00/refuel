import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem; /* 12px 16px */
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  color: #495057;
  transition:
    border-color 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  min-height: 150px; /* 複数行入力用に高さを確保 */

  &:focus {
    border-color: #007aff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    outline: none;
  }
`;

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => <StyledTextarea {...props} ref={ref} />);

Textarea.displayName = 'Textarea'; // React DevToolsでの表示名

export default Textarea;
