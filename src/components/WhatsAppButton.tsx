import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5511947082171?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20as%20mangueiras%20e%20conex%C3%B5es."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center hover:shadow-xl group"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap group-hover:ml-2 font-bold tracking-wide">
        Atendimento
      </span>
    </a>
  )
}
