import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router'
import { router } from './router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'var(--color-primary-500)',
          colorPrimaryHover: 'var(--color-primary-600)',
          colorPrimaryActive: 'var(--color-primary-700)',
          colorText: 'var(--color-dark)',
          colorTextPlaceholder: 'var(--color-primary-400)',
          colorBorder: 'var(--color-primary-200)',
          colorBorderSecondary: 'var(--color-primary-100)',
          controlOutline: 'var(--color-primary-100)',
          controlOutlineWidth: 2,
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          fontSizeLG: 14,
          borderRadius: 12,
          borderRadiusLG: 12,
          controlHeight: 44,
          controlHeightLG: 44,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  </StrictMode>,
)
