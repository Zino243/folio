"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FAQ {
  pregunta: string
  respuesta: string
}

interface PublicFAQsProps {
  faqs: FAQ[]
  primaryColor?: string
}

function FAQItem({ faq, primaryColor }: { faq: FAQ; primaryColor: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-medium text-foreground">{faq.pregunta}</span>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-200 ${isOpen ? 'pb-4' : 'max-h-0'}`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          {faq.respuesta}
        </p>
      </div>
    </div>
  )
}

export function PublicFAQs({ faqs, primaryColor = "#000000" }: PublicFAQsProps) {
  if (faqs.length === 0) return null

  return (
    <section>
      <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        FAQ
      </h2>
      <div className="rounded-lg border border-border p-4">
        {faqs.map((faq, index) => (
          <FAQItem key={index} faq={faq} primaryColor={primaryColor} />
        ))}
      </div>
    </section>
  )
}
