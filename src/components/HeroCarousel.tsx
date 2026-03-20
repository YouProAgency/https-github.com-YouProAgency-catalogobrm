import * as React from 'react'
import Autoplay from 'embla-carousel-autoplay'

import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

const banners = [
  {
    id: 1,
    tag: 'Excelência Industrial',
    title: 'Sua máquina em',
    highlight: 'movimento',
    titleEnd: ', sempre!',
    description:
      'Mangueiras, flexíveis e conexões para indústria, oficina e lava rápido. Produtos certos, padrão técnico e prontidão pra não deixar sua operação parar.',
    image: 'https://img.usecurling.com/p/1600/600?q=industrial%20factory&color=black',
    link: '#produtos',
    buttonText: 'Ver Catálogo',
    secondaryLink: '/orcamento',
    secondaryButtonText: 'Solicitar Orçamento',
  },
  {
    id: 2,
    tag: 'Pronta Entrega',
    title: 'Mangueiras',
    highlight: 'hidráulicas',
    titleEnd: 'com entrega rápida!',
    description:
      'Linha completa de mangueiras R1 a R17, a pronta entrega. Alta pressão e durabilidade garantida para sua operação.',
    image: 'https://img.usecurling.com/p/1600/600?q=metal%20pipes%20valves&color=black',
    link: '#produtos',
    buttonText: 'Conheça a Linha',
    secondaryLink: '/orcamento',
    secondaryButtonText: 'Fale com Especialista',
  },
  {
    id: 3,
    tag: 'Linha Completa',
    title: 'Conexões e',
    highlight: 'adaptadores',
    titleEnd: 'para todos os sistemas',
    description:
      'Encontre conexões hidráulicas, industriais e pneumáticas. Qualidade Premium e Alta Performance para suas mangueiras.',
    image: 'https://img.usecurling.com/p/1600/600?q=heavy%20machinery&color=black',
    link: '#produtos',
    buttonText: 'Explorar Produtos',
    secondaryLink: '/orcamento',
    secondaryButtonText: 'Cotação Rápida',
  },
]

export function HeroCarousel() {
  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: true }))

  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <section className="relative w-full mb-12 border-b-4 border-primary bg-secondary">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="relative w-full text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-secondary/40 z-10" />
              <img
                src={banner.image}
                alt={`${banner.title} ${banner.highlight} ${banner.titleEnd}`}
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
              />
              <div className="container mx-auto px-4 md:px-6 relative z-20 py-20 md:py-28 lg:py-36 min-h-[480px] lg:min-h-[560px] flex flex-col justify-center">
                <div className="max-w-2xl space-y-6 animate-fade-in-up">
                  <span className="inline-block py-1 px-3 rounded-sm bg-primary/20 text-primary font-bold text-xs tracking-widest uppercase border border-primary/30">
                    {banner.tag}
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                    {banner.title} <span className="text-primary">{banner.highlight}</span>{' '}
                    {banner.titleEnd}
                  </h1>
                  <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed">
                    {banner.description}
                  </p>
                  <div className="pt-4 flex flex-wrap gap-4">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white px-8 h-14 text-base font-bold shadow-lg rounded-sm"
                      asChild
                    >
                      <a href={banner.link}>{banner.buttonText}</a>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 border-white/20 text-white px-8 h-14 text-base font-bold rounded-sm backdrop-blur-sm"
                      asChild
                    >
                      <a href={banner.secondaryLink}>{banner.secondaryButtonText}</a>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows */}
        <div className="hidden md:block">
          <CarouselPrevious className="left-4 lg:left-8 bg-black/50 border-white/20 text-white hover:bg-primary hover:text-white hover:border-primary h-12 w-12" />
          <CarouselNext className="right-4 lg:right-8 bg-black/50 border-white/20 text-white hover:bg-primary hover:text-white hover:border-primary h-12 w-12" />
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                current === index ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/80',
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Ir para o slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  )
}
