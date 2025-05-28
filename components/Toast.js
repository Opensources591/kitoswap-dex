"use client"

import { useState } from "react"

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = "info", duration = 5000) => {
    const id = Date.now()
    const toast = { id, message, type, duration }
    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return { toasts, addToast, removeToast }
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const { id, message, type } = toast

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500/90 border-green-400 text-green-100"
      case "error":
        return "bg-red-500/90 border-red-400 text-red-100"
      case "warning":
        return "bg-yellow-500/90 border-yellow-400 text-yellow-100"
      default:
        return "bg-blue-500/90 border-blue-400 text-blue-100"
    }
  }

  return (
    <div className={`${getToastStyles()} border backdrop-blur-md rounded-lg p-4 max-w-sm shadow-lg`}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium">{message}</p>
        <button onClick={() => onRemove(id)} className="ml-2 text-white/70 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  )
}
