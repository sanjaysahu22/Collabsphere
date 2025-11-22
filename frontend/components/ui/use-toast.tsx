// Adapted from https://ui.shadcn.com/docs/components/toast
import * as React from "react"
import { ReactNode } from "react"

type ToastProps = {
  title?: string
  description?: string
  action?: ReactNode
  variant?: "default" | "destructive"
}

const ToastContext = React.createContext<{
  toast: (props: ToastProps) => void
} | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    // Remove unused id variable since we're not using it
    setToasts((prev) => [...prev, props])
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((_, i) => i !== 0))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
        {toasts.map((t, i) => (
          <div 
            key={i}
            className={`p-4 rounded-md shadow-lg transition-all transform translate-y-0 opacity-100
              ${t.variant === "destructive" ? "bg-red-600" : "bg-zinc-800"} text-white`}
          >
            {t.title && <h3 className="font-medium">{t.title}</h3>}
            {t.description && <p className="text-sm opacity-90">{t.description}</p>}
            {t.action && <div className="mt-2">{t.action}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export { ToastContext, type ToastProps }
