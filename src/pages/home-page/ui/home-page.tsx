
'use client'
import { SwitchLanguage } from '@/widgets/switch-language'
import { useTranslation } from 'react-i18next'

export const HomePage = () => {
  const { t } = useTranslation()
  return (
    <div>
      Welcome to {t('AppName')}
      <SwitchLanguage />
    </div>
  )
}
