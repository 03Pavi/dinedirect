'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface UseHistoryModalOptions {
  open: boolean
  onClose: () => void
  modalId?: string
}

/**
 * Custom hook to integrate modals/dialogs with browser history.
 * - When opened, pushes a history state so the browser back button closes the modal.
 * - When back button is pressed, closes the modal without navigating away from the page.
 * - When closed via UI (Cancel, X, Backdrop), removes the modal state from history.
 */
export function useHistoryModal({ open, onClose, modalId = 'modal' }: UseHistoryModalOptions) {
  const isPushedRef = useRef(false)
  const isPopStateRef = useRef(false)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Listen for browser back button (popstate event)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePopState = () => {
      if (isPushedRef.current) {
        isPushedRef.current = false
        isPopStateRef.current = true
        onCloseRef.current()
        setTimeout(() => {
          isPopStateRef.current = false
        }, 80)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Push state when opened, pop state if closed programmatically
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (open) {
      if (!isPushedRef.current && !isPopStateRef.current) {
        window.history.pushState({ modalOpen: true, modalId }, '')
        isPushedRef.current = true
      }
    } else {
      if (isPushedRef.current) {
        isPushedRef.current = false
        if (!isPopStateRef.current) {
          window.history.back()
        }
      }
    }
  }, [open, modalId])

  // Clean up if component unmounts while modal is open
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && isPushedRef.current) {
        isPushedRef.current = false
        window.history.back()
      }
    }
  }, [])

  // Explicit close handler for close buttons, Cancel buttons, and Backdrop clicks
  const handleClose = useCallback(() => {
    if (isPushedRef.current) {
      isPushedRef.current = false
      window.history.back()
    }
    onCloseRef.current()
  }, [])

  return { handleClose }
}
