/**
 * HowItWorksStacking - Stacking cards scroll effect for "How It Works" section
 * Desktop only - uses CSS sticky positioning for card stacking effect
 * 
 * IMPORTANT: This component must NOT be inside a parent with overflow:hidden
 * as that breaks position:sticky behavior.
 */

const steps = [
  {
    step: '01',
    title: 'Build Your Bag',
    desc: 'Select a backpack from our extensive catalog, then add your gear piece by piece. Watch your total pack weight update in real-time as you customize your loadout for any adventure.',
    image: 'https://wxsnnnijzjyasjfqxzhc.supabase.co/storage/v1/object/public/img/step1.png'
  },
  {
    step: '02',
    title: 'Plan Your Trip',
    desc: 'Associate your carefully curated bag with an upcoming adventure. Add trip details like location, dates, expected conditions, and notes to keep everything organized.',
    image: 'https://wxsnnnijzjyasjfqxzhc.supabase.co/storage/v1/object/public/img/step2.png'
  },
  {
    step: '03',
    title: 'Iterate & Improve',
    desc: 'After your trip, log your stats. Record lessons learned, then duplicate your bag and tweak it for next time. Explore the full gear catalog to find the best gear for your next trip.',
    image: 'https://wxsnnnijzjyasjfqxzhc.supabase.co/storage/v1/object/public/img/step3.png'
  }
];

export default function HowItWorksStacking() {
  return (
    <section className="relative">
      {/* Section header - NOT sticky, scrolls away naturally */}
      <div className="pt-12 pb-16 text-center">
        <span className="badge badge-secondary mb-4">How It Works</span>
        <h2 
              className="text-display text-3xl md:text-5xl mb-4 text-black"
              style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.3)',
                filter: 'brightness(1.1)'
              }}
            >
          <span className="font-bold">Three </span> steps to a lighter pack
        </h2>
      </div>

      {/* Stacking cards container */}
      <div className="relative pb-32">
        {steps.map((item, index) => (
          <div
            key={index}
            className="sticky mb-24"
            style={{
              // Each card sticks slightly lower to peek from behind
              top: `${120 + index * 20}px`,
              zIndex: 10 + index,
            }}
          >
            {/* Card content - transparent/glassmorphism background */}
            <div className="container">
              <div 
                className="rounded-2xl p-8 md:p-16 backdrop-blur-md"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  {/* Left side - Step number and title */}
                  <div className="space-y-4">
                    <div 
                      className="text-7xl md:text-8xl font-bold text-gradient"
                      style={{ opacity: .6 }}
                    >
                      {item.step}
                    </div>
                    <h3 
                      className="text-display text-2xl md:text-3xl"
                      style={{ color: 'var(--color-neutral-900)' }}
                    >
                      {item.title}
                    </h3>
                    <p 
                      className="text-body text-base md:text-lg leading-relaxed"
                      style={{ color: 'var(--color-neutral-600)' }}
                    >
                      {item.desc}
                    </p>
                    
                    {/* Step indicator dots */}
                    <div className="flex gap-2 pt-4">
                      {steps.map((_, dotIndex) => (
                        <div
                          key={dotIndex}
                          className="w-2 h-2 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: dotIndex === index 
                              ? 'var(--color-primary-500)' 
                              : 'var(--color-neutral-300)'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right side - Image/Demo placeholder */}
                  <div className="relative">
                    <div 
                      className="rounded-xl overflow-hidden shadow-lg"
                      style={{ 
                        aspectRatio: '16/10'
                      }}
                    >
                      <img
                        src={item.image}
                        alt={`${item.title} demonstration`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
      
