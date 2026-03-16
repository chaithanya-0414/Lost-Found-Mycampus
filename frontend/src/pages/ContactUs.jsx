import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactUs = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 py-10">
            {/* Header */}
            <div className="text-center space-y-4">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-black text-text-main tracking-tight"
                >
                    Get in <span className="text-primary-blue font-light">Touch</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-text-muted text-lg max-w-2xl mx-auto font-medium"
                >
                    Have questions about a lost item or how the platform works? We're here to help the campus stay connected.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Contact Info Cards */}
                {[
                    { icon: Mail, label: 'Email Us', value: 'support@campus-lostfound.edu', sub: '24/7 Priority Support' },
                    { icon: Phone, label: 'Call Us', value: '+1 (555) 012-3456', sub: 'Mon-Fri, 9am - 5pm' },
                    { icon: MapPin, label: 'Visit Us', value: 'Student Center, Room 204', sub: 'Campus Main Hub' }
                ].map((item, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                        className="card-saas p-8 text-center group transition-all shadow-xl shadow-black/[0.02]"
                    >
                        <div className="w-14 h-14 bg-dashboard-bg border border-dashboard-border rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform text-primary-blue shadow-sm">
                            <item.icon size={28} />
                        </div>
                        <h3 className="text-text-main font-bold text-lg mb-2">{item.label}</h3>
                        <p className="text-primary-blue font-semibold mb-1">{item.value}</p>
                        <p className="text-text-muted text-xs uppercase font-black tracking-widest">{item.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Contact Form */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card-saas p-10 shadow-2xl shadow-primary-blue/5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary-blue pointer-events-none">
                        <MessageSquare size={120} />
                    </div>
                    <h2 className="text-3xl font-black text-text-main mb-8">Send a <span className="text-primary-blue font-light">Message</span></h2>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                                <input type="text" placeholder="John Doe" className="w-full bg-dashboard-bg border border-dashboard-border rounded-xl py-4 px-6 text-text-main focus:outline-none focus:border-primary-blue transition-all font-medium placeholder:text-text-muted/30" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                                <input type="email" placeholder="john@example.com" className="w-full bg-dashboard-bg border border-dashboard-border rounded-xl py-4 px-6 text-text-main focus:outline-none focus:border-primary-blue transition-all font-medium placeholder:text-text-muted/30" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Subject</label>
                            <input type="text" placeholder="General Inquiry" className="w-full bg-dashboard-bg border border-dashboard-border rounded-xl py-4 px-6 text-text-main focus:outline-none focus:border-primary-blue transition-all font-medium placeholder:text-text-muted/30" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Message</label>
                            <textarea rows="5" placeholder="How can we help you?" className="w-full bg-dashboard-bg border border-dashboard-border rounded-xl py-4 px-6 text-text-main focus:outline-none focus:border-primary-blue transition-all resize-none font-medium placeholder:text-text-muted/30"></textarea>
                        </div>
                        <button className="w-full py-5 bg-primary-blue hover:bg-primary-hover rounded-2xl font-black text-white flex items-center justify-center gap-3 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-primary-blue/20">
                            <Send size={20} />
                            Send Message
                        </button>
                    </form>
                </motion.div>

                {/* FAQ / Info */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-8"
                >
                    <h2 className="text-3xl font-black text-text-main">Frequently Asked <span className="text-primary-blue font-light">Questions</span></h2>
                    
                    <div className="space-y-4">
                        {[
                            { q: 'How do I claim a found item?', a: 'Navigate to the item details page and click "Verify Ownership". You will need to provide a description of the item.' },
                            { q: 'What happens after I report a lost item?', a: 'Our AI engine immediately scans all found items to find matches. You will see suggested matches on your item details page.' },
                            { q: 'Can I edit my report after submission?', a: 'Yes, if you are the reporter, you can click "Edit Details" on your reported items to update information or images.' }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-dashboard-border shadow-sm shadow-black/[0.01]">
                                <h4 className="font-bold text-text-main mb-2">{faq.q}</h4>
                                <p className="text-text-muted text-sm leading-relaxed font-medium">{faq.a}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 bg-primary-blue/5 border border-dashed border-primary-blue/20 rounded-[40px]">
                        <p className="text-primary-blue font-bold italic text-center">
                            "Connecting campus through integrity and community. Together, we find what's lost."
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactUs;
