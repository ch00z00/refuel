import styled, { css } from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

const baseButtonStyles = css`
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1.25rem; /* 10px 20px */
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    transform 0.1s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const primaryStyles = css`
  background-color: #007aff;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.2);
  &:hover {
    background-color: #005ecb;
  }
`;

const secondaryStyles = css`
  background-color: #e9ecef;
  color: #343a40;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  &:hover {
    background-color: #ced4da;
  }
`;

const dangerStyles = css`
  background-color: #dc3545;
  color: white;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
  &:hover {
    background-color: #c82333;
  }
`;

const sizeStyles = {
  small: css`
    padding: 0.375rem 0.75rem; /* 6px 12px */
    font-size: 0.875rem; /* 14px */
  `,
  medium: css`
    padding: 0.625rem 1.25rem; /* 10px 20px */
    font-size: 1rem; /* 16px */
  `,
  large: css`
    padding: 0.75rem 1.5rem; /* 12px 24px */
    font-size: 1.125rem; /* 18px */
  `,
};

export const Button = styled.button<ButtonProps>`
  ${baseButtonStyles}
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return primaryStyles;
      case 'secondary':
        return secondaryStyles;
      case 'danger':
        return dangerStyles;
      default:
        return primaryStyles; // Default to primary
    }
  }}
  ${({ size }) => sizeStyles[size || 'medium']}
`;

export default Button;
