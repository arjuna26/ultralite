import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import PublicFooter from '../components/PublicFooter';
import HowItWorksStacking from '../components/HowItWorksStacking';
import PopularGearCarousel from '../components/PopularGearCarousel';
import FeedbackModal from '../components/FeedbackModal';

// Icons as simple SVG components
const BackpackIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const ScaleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
);

const DuplicateIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const MapIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg className="w-5 h-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

// Feature data
const features = [
  {
    icon: BackpackIcon,
    title: 'Build Your Perfect Pack',
    description: 'Curate gear setups from our extensive catalog. Organize items by category and build bags tailored to any adventure.'
  },
  {
    icon: ScaleIcon,
    title: 'Track Every Gram',
    description: 'Real-time weight calculations as you add or remove gear. Know exactly what your pack weighs before you hit the trail.'
  },
  {
    icon: DuplicateIcon,
    title: 'Duplicate & Iterate',
    description: 'Found a setup that works? Duplicate it instantly. Tweak for different conditions without starting from scratch.'
  },
  {
    icon: MapIcon,
    title: 'Trip Planning',
    description: 'Associate bags with trips. Plan multiple adventures and track which gear configuration you used for each.'
  },
  {
    icon: ChartIcon,
    title: 'Trip Stats & Insights',
    description: 'Log miles, elevation, and nights. Record weather conditions and lessons learned for continuous improvement.'
  },
  {
    icon: DatabaseIcon,
    title: 'Extensive Gear Database',
    description: 'Access thousands of verified gear weights from top brands. No more Googling specs—it\'s all here.'
  }
];

// Pricing data
const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    description: 'Perfect for getting started',
    features: [
      'Up to 3 bags',
      'Add your own gear',
      'Weight tracking',
      '1 active trip'
    ],
    cta: 'Get Started',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '$5',
    period: '/month',
    description: 'For serious backpackers',
    features: [
      'Unlimited bags',
      'Full gear catalog',
      'Duplicate bags',
      'Unlimited trips',
      'Trip statistics',
      'Export to CSV'
    ],
    cta: 'Start Free Trial',
    highlighted: true
  }
];

// Testimonial data
const testimonials = [
  {
    quote: "Finally ditched my spreadsheet! UltraLite makes it so easy to experiment with different gear setups without losing my mind.",
    author: "Sarah K.",
    role: "Thru-hiker, PCT '24",
    rating: 5
  },
  {
    quote: "The duplicate feature is a game-changer. I have base setups for summer, winter, and ultralight trips that I just clone and tweak.",
    author: "Marcus T.",
    role: "Weekend Warrior",
    rating: 5
  },
  {
    quote: "Being able to see exactly how much each item contributes to my pack weight helped me cut 3 pounds. Worth every penny.",
    author: "Jen L.",
    role: "Section Hiker",
    rating: 5
  }
];

// Mock data for Community Trips stacking section; replace with getCommunityTrips() when backend is ready
const mockCommunityGear = [
  {
    gear_id: 'mock-1',
    brand: 'Columbia',
    model: 'Wildwood Heights',
    weight_grams: 1540,
    image_url: 'https://wxsnnnijzjyasjfqxzhc.supabase.co/storage/v1/object/public/gear/columbia_wildwood_heights.png',
  },
  {
    gear_id: 'mock-2',
    brand: 'Big Agnes',
    model: 'Copper Spur mtnGlo 2',
    weight_grams: 1247,
    image_url: 'https://wxsnnnijzjyasjfqxzhc.supabase.co/storage/v1/object/public/gear/Copper_Spur_mtnGLO_2_Tent.png',
  },
  {
    gear_id: 'mock-3',
    brand: 'Jetboil',
    model: 'Flash 1.0 L Fast Boil System',
    weight_grams: 371,
    image_url: 'https://wxsnnnijzjyasjfqxzhc.supabase.co/storage/v1/object/public/gear/Flash_1.0_L_Fast_Boil_System.png',
  },
  {
    gear_id: 'mock-4',
    brand: 'NEMO',
    model: 'Tensor Regular Wide',
    weight_grams: 620,
    image_url: 'https://wxsnnnijzjyasjfqxzhc.supabase.co/storage/v1/object/public/gear/nemo_tensor_reg_wide.webp',
  },

];

export default function Landing() {

  useScrollReveal();
  
  const [scrollY, setScrollY] = useState(0);
  const [heroHeight, setHeroHeight] = useState(600);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => {
      const heroSection = document.querySelector('.hero-gradient');
      if (heroSection) {
        setHeroHeight(heroSection.offsetHeight);
      }
    };

    handleResize();
    const timer = setTimeout(handleResize, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
      <Helmet>
        <title>UltraLite | Pack Smarter, Hike Lighter</title>
        <meta name="description" content="Build, track, and optimize your backpacking gear. Know exactly what your pack weighs before you hit the trail. Free gear planner for ultralight hikers." />
        <meta name="keywords" content="ultralight backpacking, gear list, pack weight tracker, backpacking planner" />
        <link rel="canonical" href="https://ultralite.app" />
      </Helmet>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md">
        <div className="container">
          <div className="flex items-center justify-between h-18">
            <Link to="/" className="flex items-center gap-2 hover-scale">
                <img src="/favicon.svg" alt="UltraLite" className="w-8 h-8" />
                <span className="text-xl font-semibold" style={{ color: 'var(--color-neutral-900)' }}>UltraLite</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="nav-link hover-underline text-sm">Features</a>
              <a href="#pricing" className="nav-link hover-underline text-sm">Pricing</a>
              <a href="#reviews" className="nav-link hover-underline text-sm">Reviews</a>
              <a href="#featured" className="nav-link hover-underline text-sm">Gear</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Gradient accent bar */}
      <div className="gradient-bar h-1 fixed top-16 left-0 right-0 z-40 opacity-80"></div>

      {/* Hero + How it Works wrapper with shared gradient background */}
      <div className="relative" style={{ backgroundColor: 'var(--color-surface-primary)' }}>

      <div className="relative md:block hidden mt-16">
        <div 
          className="absolute inset-0 z-0 md:block hidden"
          style={{
            backgroundImage: 'url(https://wxsnnnijzjyasjfqxzhc.supabase.co/storage/v1/object/public/img/tetonsreflect.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        {/* Light overlay for text readability */}
        <div 
          className="absolute inset-0 z-0 pricing-overlay"
          style={{
            backgroundColor: 'var(--color-primary-300)',
            opacity: 0.5
          }}
        />
      
        {/* CTA Section */}
        <section className="section scroll-reveal relative overflow-hidden z-10 md:h-[300px]">
        </section>
      </div>
        
      {/* Hero Section */}
      <section className="pt-32 md:pt-16 pb-20 relative topo-pattern">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
          <h1 className="text-display text-5xl md:text-5xl lg:text-7xl mb-10 text-black">
            Pack Smarter, Hike <span className="text-gradient-hero font-bold"> Lighter</span>
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 scroll-reveal-right px-4 sm:px-0">
            <Link to="/login" className="btn btn-primary btn-lg w-full sm:w-auto">
              Start Building Your Pack
            </Link>
            <button
              type="button"
              className="btn btn-outline btn-lg w-full sm:w-auto"
              onClick={() => setIsFeedbackOpen(true)}
            >
              Got Suggestions?
            </button>
          </div>
          <p className="text-body text-lg md:text-xl mt-6 max-w-2xl mx-auto px-2">
            The trip-centric gear management app that helps you build, track, and optimize your backpacking setups. 
            Know exactly what you're carrying before you hit the trail.
          </p>
        </div>
      </section>
      
      {/* Desktop version - Stacking cards (shares background with Hero) */}
      <div id="how-it-works" className="" style={{ backgroundColor: 'var(--color-secondary-50)' }}>
        <HowItWorksStacking />
      </div>

      <section id="featured" className="relative overflow-hidden topo-pattern-md md:pt-20 py-8">
        <div className="container scroll-reveal flex flex-col items-center justify-center">
          <span className="badge badge-secondary mb-4">Gear</span>
          <h2 className="text-display text-3xl md:text-5xl mb-4 text-black text-center">Popular Gear</h2>
        </div>
        {/* Desktop */}
        <div className="">
          <PopularGearCarousel gear={mockCommunityGear} />
        </div>
      </section>

      </div>
      {/* Features & Pricing Section with shared background */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 md:block hidden"
          style={{
            backgroundImage: 'url(https://wxsnnnijzjyasjfqxzhc.supabase.co/storage/v1/object/public/img/tetonsreflect.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        {/* Light overlay for text readability */}
        <div 
          className="absolute inset-0 z-0 pricing-overlay md:block hidden"
          style={{
            backgroundColor: 'var(--color-primary-400)',
            opacity: 0.5
          }}
        />
        <div className="absolute inset-0 z-0 pricing-overlay md:hidden block topo-pattern"
                  style={{
                    backgroundColor: 'var(--color-secondary-50)',
                    opacity: 0.5
                  }}>
          </div>
      
      {/* Testimonials Section */}
      <section id="reviews" className="section md:mt-32">
        <div className="container">
          <div className="text-center mb-16 scroll-reveal">
            <span className="badge badge-secondary mb-4">Reviews</span>
            <h2
              className="text-display text-3xl md:text-5xl mb-4 text-black md:text-white"
            >
              Loved by backpackers from <span className="font-bold"  style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.3)',
                filter: 'brightness(1.1)'
              }}>everywhere</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl p-8 md:p-8 backdrop-blur-md hover-lift scroll-reveal border border-white"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className="flex gap-1 mb-4" style={{ color: 'var(--color-accent-400)' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} filled />
                  ))}
                </div>
                <p className="mb-6 md:text-white">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-400) 50%, var(--color-secondary-500) 100%)',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm md:text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-xs md:text-white/90">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Pricing Section */}
        <section id="pricing" className="section relative md:m-32">
          <div className="container">
            <div className="text-center mb-16 scroll-reveal">
              <span className="badge badge-accent mb-4">Pricing</span>
              <h2 
                className="text-display text-3xl md:text-5xl mb-4 md:text-white"
              >
                Simple, <span className="font-bold"  style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.3)',
                filter: 'brightness(1.1)'
              }}>transparent
              </span> pricing 
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto md:text-white">
              {pricingPlans.map((plan, index) => (
                <div 
                  key={index}
                  className={`card hover-glow p-6 backdrop-blur-md scroll-reveal flex flex-col ${plan.highlighted ? 'card-highlighted' : ''}`}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    transitionDelay: `${index * 100}ms`,
                    ...(plan.highlighted ? { '--tw-ring-color': 'var(--color-primary-500)' } : {})
                  }}
                >
                  <div className="flex items-center gap-5 mb-1">
                      <h3 className="font-bold text-xl">{plan.name}</h3>
                      {plan.highlighted && (
                          <div className="badge badge-primary"
                                style={{
                                  background: 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-400) 50%, var(--color-secondary-500) 100%)',
                                  color: 'white',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                }}>Great Value</div>
                      )}
                  </div>
                  <p className="md:text-white mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="md:text-green-400">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2 text-sm">
                        <span style={{ color: 'var(--color-primary-300)' }}><CheckIcon /></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.highlighted ? (
                    <button
                      type="button"
                      className="btn btn-primary mt-auto w-full"
                      onClick={() => setIsFeedbackOpen(true)}
                    >
                      {plan.cta}
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-secondary mt-auto w-full">
                      {plan.cta}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section id="features" className="section relative z-10 py-16 md:topo-pattern" style={{ backgroundColor: 'var(--color-secondary-50)' }}>
        <div className="container">
          <div className="text-center mb-16 scroll-reveal">
            <span className="badge badge-primary mb-4">Features</span>
            <h2 
              className="text-display text-3xl md:text-5xl mb-4 text-black"
              style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.3)',
                filter: 'brightness(1.1)'
              }}
            >
              Everything you need to go <span className="font-bold">ultralight</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="rounded-2xl p-8 md:p-16 backdrop-blur-md"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transitionDelay: `${index * 50}ms` 
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 hover-rotate"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-400) 50%, var(--color-secondary-500) 100%)',
                    color: 'white',
                    boxShadow: '0 0 20px rgba(61, 139, 108, 0.35)'
                  }}
                >
                  <feature.icon />
                </div>
                <h3 className="text-heading text-lg mb-2">{feature.title}</h3>
                <p className="text-body text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <PublicFooter onOpenFeedback={() => setIsFeedbackOpen(true)} />
    </div>
  );
}
