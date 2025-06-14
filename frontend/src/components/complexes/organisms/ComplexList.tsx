import React from 'react';
import styled from 'styled-components';
import type { Complex } from '../../../types/complex';
import ComplexCard from './ComplexCard';
import NoComplexesMessage from './NoComplexesMessage';

const ListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem; /* 24px */
`;

interface ComplexListProps {
  complexes: Complex[];
  // eslint-disable-next-line no-unused-vars
  onViewGoals: (id: number) => void;
  // eslint-disable-next-line no-unused-vars
  onEdit: (id: number) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: number) => void;
  onAddNewComplex: () => void; // For NoComplexesMessage
}

const ComplexList: React.FC<ComplexListProps> = ({
  complexes,
  onViewGoals,
  onEdit,
  onDelete,
  onAddNewComplex,
}) => {
  if (complexes.length === 0) {
    return <NoComplexesMessage onAddNewComplex={onAddNewComplex} />;
  }

  return (
    <ListWrapper>
      {complexes.map((complex, index) => (
        <ComplexCard
          key={complex.id}
          complex={complex}
          onViewGoals={onViewGoals}
          onEdit={onEdit}
          onDelete={onDelete}
          animationDelay={index * 0.1} // Stagger animation
        />
      ))}
    </ListWrapper>
  );
};

export default ComplexList;
