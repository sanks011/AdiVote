import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Github, Linkedin, Mail, Globe, Code, Palette, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
  icon: React.ReactNode;
  bio: string;
  links?: {
    github?: string;
    linkedin?: string;
    email?: string;
    website?: string;
  };
}

const Team = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Sahnik Biswas",
      role: "Lead Developer",
      imageUrl: "public/sahnik.jpg",
      icon: <Code className="h-5 w-5 text-white" />,
      bio: "Full-stack developer focused on creating secure and efficient voting systems. Experienced in React, Firebase, and user authentication.",
      links: {
        github: "https://github.com/Sahnik0",
        linkedin: "https://linkedin.com/in/sahnik-biswas",
        email: "sahnik.biswas@stu.adamasuniversity.ac.in"
      }
    },
    {
      name: "Pranjal Mohata",
      role: "UI/UX Designer",
      imageUrl: "public/pranjal.jpg",
      icon: <Palette className="h-5 w-5 text-white" />,
      bio: "Creative designer with a passion for creating intuitive and accessible user interfaces. Contributed to the visual design and user experience of AdiVote.",
      links: {
        github: "https://github.com/pmohata34",
        linkedin: "https://www.linkedin.com/in/pranjal-mohata-926617289?",
        email: "pranjal.mohata@stu.adamasuniversity.ac.in"
      }
    },
    {
      name: "Sankalpa Sarkar",
      role: "Backend Developer",
      imageUrl: "public/sankalpa.jpg",
      icon: <Database className="h-5 w-5 text-white" />,
      bio: "Specialized in database management and API development. Responsible for the secure voting infrastructure and data integrity of the AdiVote platform.",
      links: {
        github: "https://github.com/sanks011",
        linkedin: "https://www.linkedin.com/in/sankalpacodes",
        email: "sankalpa.sarkar@stu.adamasuniversity.ac.in"
      }
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6 text-gray-600 hover:text-[#33CC33] transition-colors duration-200 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform duration-200" />
            Back to Home
          </Button>
        </Link>
      
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="p-2 rounded-full bg-[#33CC33]/10">
              <Users className="h-6 w-6 text-[#33CC33]" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#33CC33] to-[#2ecc71] bg-clip-text text-transparent">
              Our Team
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Meet the talented individuals behind AdiVote who are dedicated to bringing transparent and secure voting to Adamas University
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-5xl"
        >
          {teamMembers.map((member, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="relative">
                <div className="h-56 bg-gradient-to-r from-[#33CC33]/20 to-[#2ecc71]/20 flex items-center justify-center">
                  <img 
                    src={member.imageUrl} 
                    alt={member.name} 
                    className="h-36 w-36 rounded-full border-4 border-white shadow-md object-cover"
                  />
                </div>
                <div className="absolute top-4 right-4 bg-[#33CC33] rounded-full p-2 shadow-md">
                  {member.icon}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                <p className="text-[#33CC33] font-medium">{member.role}</p>
                <p className="mt-3 text-gray-600 leading-relaxed">{member.bio}</p>
                
                {member.links && (
                  <div className="mt-6 flex space-x-4">
                    {member.links.github && (
                      <a 
                        href={member.links.github} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-600 hover:text-[#33CC33] transition-colors duration-200 hover:scale-110 transform"
                        aria-label={`${member.name}'s GitHub`}
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {member.links.linkedin && (
                      <a 
                        href={member.links.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-600 hover:text-[#33CC33] transition-colors duration-200 hover:scale-110 transform"
                        aria-label={`${member.name}'s LinkedIn`}
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {member.links.email && (
                      <a 
                        href={`mailto:${member.links.email}`} 
                        className="text-gray-600 hover:text-[#33CC33] transition-colors duration-200 hover:scale-110 transform"
                        aria-label={`Email ${member.name}`}
                      >
                        <Mail className="h-5 w-5" />
                      </a>
                    )}
                    {member.links.website && (
                      <a 
                        href={member.links.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-600 hover:text-[#33CC33] transition-colors duration-200 hover:scale-110 transform"
                        aria-label={`${member.name}'s Website`}
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-3xl mx-auto border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Join Our Team</h3>
            <p className="text-gray-600 mb-6">
              Are you passionate about democracy, technology, and creating a better experience for students? 
              We're always looking for talented individuals to join our team and contribute to the AdiVote platform.
            </p>
            <Button className="bg-[#33CC33] hover:bg-[#2ecc71] text-white">
              <Mail className="mr-2 h-4 w-4" />
              <a href="mailto:sahnik.biswas@stu.adamasuniversity.ac.in">Contact Us</a>
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500">© 2025 AdiVote. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Team;