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
    { icon: Camera, label: 'Projects Completed', value: '250+' },
    { icon: Film, label: 'Hours of Footage', value: '5,000+' },
    { icon: Users, label: 'Happy Clients', value: '300+' },
    { icon: Award, label: 'Years of Experience', value: '6+' }
  ];

  const teamRow1 = [
    {
      name: 'Upasak Mukherjee',
      specialty: 'Cinematographer & Photographer',
      description: 'Capturing authentic emotions with 6+ years of experience',
      image: 'https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/66po98n1_000%20%281%29.jpg.jpeg'
    },
    {
      name: 'Deep Shekhar Ojha',
      specialty: 'Candid & Wide Photographer',
      description: 'Specialists in capturing genuine, unposed moments',
      image: 'https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/63pucjxl_IMG_4001.JPG.jpeg'
    },
    {
      name: 'Debraj Roy',
      specialty: 'Candid & Portrait Photographer',
      description: 'Specialists in capturing genuine, unguarded moments',
      image: 'https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/v0nopnby_IMG_4003.JPG.jpeg'
    },
    {
      name: 'Sandip Pal',
      specialty: 'Cinematographer',
      description: 'Creating cinematic stories with cutting-edge equipment',
      image: 'https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/bg63o1bb_IMG_4002.JPG.jpeg'
    }
  ];

  const teamRow2 = [
    {
      name: 'Rudra Pratap Sen',
      specialty: 'Portrait Photographer',
      description: 'Specialists in capturing genuine, heartfelt moments',
      image: ''
    },
    {
      name: 'Abhirup Roy',
      specialty: 'Wide & Candid Photographer',
      description: 'Specialists in capturing genuine, authentic moments',
      image: ''
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
            About <span className="text-[#D4AF37]">Us</span>
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
                  Founded in Asansol, we've been capturing the essence of life's most precious moments for over 6 years. 
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
              className="relative h-96 rounded-xl overflow-hidden"
            >
              <img
                src="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/84ethlvw_IMG_4004.JPG.jpeg"
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
                className="bg-[#121212] border border-white/5 p-6 rounded-xl text-center hover:border-[#D32F2F]/30 transition-all duration-300"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamRow1.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, transition: { duration: 0.35, ease: 'easeOut' } }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="group bg-[#121212] border border-white/5 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 hover:shadow-xl hover:shadow-[#D4AF37]/10 transition-all duration-500 cursor-pointer"
                data-testid={`team-member-${idx}`}
              >
                {member.image && (
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent group-hover:from-[#121212]/90 transition-all duration-500" />
                  </div>
                )}
                <div className="p-6 transition-transform duration-300 group-hover:translate-y-[-4px]">
                  <h3 className="font-heading text-xl font-bold mb-2 group-hover:text-[#D4AF37] transition-colors duration-300">{member.name}</h3>
                  <p className="text-[#D32F2F] text-sm mb-3 uppercase tracking-widest">{member.specialty}</p>
                  <p className="text-sm text-[#A3A3A3] leading-relaxed">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Second Row - Centered */}
          <div className="flex flex-col md:flex-row justify-center gap-8 mt-8">
            {teamRow2.map((member, idx) => (
              <motion.div
                key={idx + 4}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, transition: { duration: 0.35, ease: 'easeOut' } }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="group bg-[#121212] border border-white/5 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 hover:shadow-xl hover:shadow-[#D4AF37]/10 transition-all duration-500 w-full md:w-[calc(25%-1rem)] cursor-pointer"
                data-testid={`team-member-${idx + 4}`}
              >
                <div className="relative h-80 overflow-hidden bg-[#1A1A1A] flex items-center justify-center">
                  {member.image ? (
                    <>
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent group-hover:from-[#121212]/90 transition-all duration-500" />
                    </>
                  ) : (
                    <div className="text-[#A3A3A3]/30 flex flex-col items-center gap-3 group-hover:text-[#D4AF37]/40 transition-colors duration-500">
                      <Camera size={48} />
                      <span className="text-xs uppercase tracking-widest">Photo Coming Soon</span>
                    </div>
                  )}
                </div>
                <div className="p-6 transition-transform duration-300 group-hover:translate-y-[-4px]">
                  <h3 className="font-heading text-xl font-bold mb-2 group-hover:text-[#D4AF37] transition-colors duration-300">{member.name}</h3>
                  <p className="text-[#D32F2F] text-sm mb-3 uppercase tracking-widest">{member.specialty}</p>
                  <p className="text-sm text-[#A3A3A3] leading-relaxed">{member.description}</p>
                </div>
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
            className="bg-gradient-to-br from-[#D32F2F]/10 to-[#D4AF37]/10 border border-[#D32F2F]/20 p-8 md:p-12 rounded-xl text-center"
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
