import React from 'react';
import styled from 'styled-components';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Header from '../components/common/molecules/Header';
import Button from '../components/common/atoms/Button';
import Input from '../components/common/atoms/Input';
import Textarea from '../components/common/atoms/Textarea';
import FormGroup from '../components/common/molecules/FormGroup';

import type { Complex, ComplexInput } from '../types/complex';
import { createComplex } from '../services/api';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex-grow: 1;
  max-width: 800px; /* フォーム用に少し狭く */
  margin: 0 auto;
  padding: 2rem 1rem; /* 32px 16px */
  width: 100%;
`;

const PageTitle = styled.h2`
  font-size: 2rem; /* 32px */
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 2rem; /* 32px */
  text-align: center;
`;

const Form = styled.form`
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  padding: 2rem; /* 32px */
`;

const ActionsWrapper = styled.div`
  display: flex;
  gap: 1rem; /* 16px */
  justify-content: flex-end;
  margin-top: 2rem; /* 32px */
`;

const ComplexFormPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ComplexInput>();

  const createComplexMutation = useMutation<Complex, Error, ComplexInput>({
    mutationFn: createComplex,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complexes'] }); // コンプレックス一覧キャッシュを無効化
      // eslint-disable-next-line no-undef
      alert(t('complexForm.successMessage')); // 成功メッセージ
      navigate('/'); // 一覧ページへ遷移
    },
    onError: (error) => {
      // eslint-disable-next-line no-undef
      alert(`${t('complexForm.errorMessage')}: ${error.message}`); // エラーメッセージ
    },
  });

  const onSubmit: SubmitHandler<ComplexInput> = (data) => {
    createComplexMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate('/'); // キャンセルで一覧ページへ戻る
  };

  return (
    <PageWrapper>
      <Header onAddNewComplex={() => navigate('/complexes/new')} />{' '}
      {/* ヘッダーのボタンは自身のページへ */}
      <MainContent>
        <PageTitle>{t('complexForm.title')}</PageTitle>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup
            label={t('complexForm.contentLabel')}
            htmlFor="content"
            error={errors.content?.message}
          >
            <Textarea
              id="content"
              {...register('content', {
                required: t('complexForm.contentRequired'),
              })}
            />
          </FormGroup>
          <FormGroup
            label={t('complexForm.categoryLabel')}
            htmlFor="category"
            error={errors.category?.message}
          >
            <Input
              id="category"
              type="text"
              {...register('category', {
                required: t('complexForm.categoryRequired'),
              })}
            />
          </FormGroup>
          <ActionsWrapper>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={createComplexMutation.isPending}
            >
              {t('complexForm.cancelButton')}
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={createComplexMutation.isPending}
            >
              {createComplexMutation.isPending
                ? t('complexForm.savingButton')
                : t('complexForm.submitButton')}
            </Button>
          </ActionsWrapper>
        </Form>
      </MainContent>
      {/* <Footer /> */}
    </PageWrapper>
  );
};

export default ComplexFormPage;
