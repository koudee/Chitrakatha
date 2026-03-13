import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Film, Users, Award } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const About = () => {
  const [aboutImage, setAboutImage] = useState('');

  useEffect(() => {
    fetchAboutImage();
  }, []);

  const fetchAboutImage = async () => {
    try {
      const response = await axios.get(`${API}/site-images`);
      const images = response.data.filter(img => img.section === 'about').sort((a, b) => a.order - b.order);
      if (images.length > 0) {
        setAboutImage(images[0].image_url);
      }
    } catch (error) {
      console.error('Error fetching about image:', error);
    }
  };

  const stats = [
    { icon: Camera, label: 'Projects Completed', value: '500+' },
    { icon: Film, label: 'Hours of Footage', value: '10,000+' },
    { icon: Users, label: 'Happy Clients', value: '300+' },
    { icon: Award, label: 'Years of Experience', value: '8+' }
  ];

  const team = [
    {
      name: 'Lead Photographer',
      specialty: 'Wedding & Portrait Photography',
      description: 'Capturing authentic emotions with 8+ years of experience'
    },
    {
      name: 'Chief Cinematographer',
      specialty: 'Cinematic Videography',
      description: 'Creating cinematic stories with cutting-edge equipment'
    },
    {
      name: 'Candid Photography Team',
      specialty: 'Raw & Unscripted Moments',
      description: 'Specialists in capturing genuine, unposed moments'
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4" data-testid="about-title">
            About <span className="text-[#D4AF37]">Chitrakatha</span>
          </h1>
          <p className="text-lg text-[#A3A3A3] max-w-3xl mx-auto">
            Preserving the moments that matter most through real moments and raw emotion
          </p>
        </motion.div>

        {/* Our Story */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6" data-testid="our-story-title">
                Our <span className="text-[#D32F2F]">Story</span>
              </h2>
              <div className="space-y-4 text-[#A3A3A3] leading-relaxed">
                <p>
                  <span className="font-accent text-3xl text-[#D4AF37]">Chitrakatha</span> means "Picture Story" in Bengali, 
                  and that's exactly what we do - we tell stories through pictures and films.
                </p>
                <p>
                  Founded in Asansol, we've been capturing the essence of life's most precious moments for over 8 years. 
                  Our passion lies in creating timeless visual narratives that preserve emotions, celebrate love, and 
                  honor the beautiful chaos of weddings and special events.
                </p>
                <p>
                  We believe that every moment has a story to tell, and every story deserves to be told beautifully. 
                  Our approach combines traditional photography techniques with modern cinematic storytelling, ensuring 
                  that your memories are preserved in the most authentic and artistic way possible.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-sm overflow-hidden"
            >
              <img
                src={aboutImage || 'https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/iuyyqp11_WhatsApp%20Image%202026-02-20%20at%2012.04.56%20AM%20%281%29.jpeg'}
                alt="Chitrakatha Team"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#121212] border border-white/5 p-6 rounded-sm text-center hover:border-[#D32F2F]/30 transition-all duration-300"
                data-testid={`stat-${idx}`}
              >
                <stat.icon size={32} className="text-[#D32F2F] mx-auto mb-3" />
                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-sm text-[#A3A3A3]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Our Team */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4" data-testid="team-title">
              Meet Our <span className="text-[#D4AF37]">Team</span>
            </h2>
            <p className="text-lg text-[#A3A3A3] max-w-2xl mx-auto">
              A passionate team of photographers and cinematographers dedicated to capturing your special moments
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="bg-[#121212] border border-white/5 p-6 rounded-sm hover:border-[#D4AF37]/30 transition-all duration-300"
                data-testid={`team-member-${idx}`}
              >
                <h3 className="font-heading text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-[#D32F2F] text-sm mb-3 uppercase tracking-widest">{member.specialty}</p>
                <p className="text-sm text-[#A3A3A3] leading-relaxed">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Our Philosophy */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#D32F2F]/10 to-[#D4AF37]/10 border border-[#D32F2F]/20 p-8 md:p-12 rounded-sm text-center"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6" data-testid="philosophy-title">
              Our <span className="text-[#D4AF37]">Philosophy</span>
            </h2>
            <blockquote className="text-xl md:text-2xl font-subheading italic text-[#E5E5E5] max-w-4xl mx-auto leading-relaxed">
              "Every wedding is a unique story, every couple has their own journey, and every moment deserves to be 
              captured with authenticity and artistry. We don't just take photos - we create visual heirlooms that 
              will be cherished for generations."
            </blockquote>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default About;
