import { Facebook, Heart, Instagram, Linkedin, Twitter } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Footer: React.FC = () => {
    const { user } = useAuthStore();
    return (
        <>
            <div >
                <footer className="bg-[#0D1B2A] text-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {/* Brand Section */}
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center mb-4">
                                    <h3 className="text-2xl font-bold bg-linear-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                                        Aucto
                                    </h3>
                                </div>
                                <p className="text-gray-400 mb-4 max-w-md">
                                    The ultimate auction platform where buyers and sellers connect in real-time.
                                    Experience seamless bidding with our secure and user-friendly interface.
                                </p>
                                <div className="flex gap-4">
                                    <a href="#" className="footer-hover transition-colors">
                                        <Facebook />
                                    </a>
                                    <a href="#" className="footer-hover transition-colors">
                                        <Twitter />
                                    </a>
                                    <a href="#" className="footer-hover transition-colors">
                                        <Instagram />
                                    </a>
                                    <a href="#" className="footer-hover transition-colors">
                                        <Linkedin />
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                                <ul className="space-y-2">
                                    <li>
                                        <Link to="/auctions" className="footer-hover transition-colors">
                                            Browse Auctions
                                        </Link>
                                    </li>
                                    {user?.role === 'user' && (
                                        <li>
                                            <Link to="/create-auction" className="footer-hover transition-colors">
                                                Create Auction
                                            </Link>
                                        </li>
                                    )}
                                    {
                                        user?.role === 'user' && (
                                            <li>
                                                <Link to="/dashboard" className="footer-hover transition-colors">
                                                    My Dashboard
                                                </Link>
                                            </li>
                                        )
                                    }
                                    {
                                        user?.role === 'admin' && (
                                            <li>
                                                <Link to="/admin" className="footer-hover transition-colors">
                                                    Admin Dashboard
                                                </Link>
                                            </li>
                                        )
                                    }
                                    <li>
                                        <Link to="/profile" className="footer-hover transition-colors">
                                            My Profile
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Support */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Support</h4>
                                <ul className="space-y-2">
                                    <li>
                                        <Link to="/contact" className="footer-hover transition-colors">
                                            Contact Us
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/terms-of-service" className="footer-hover transition-colors">
                                            Terms of Service
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/privacy-policy" className="footer-hover transition-colors">
                                            Privacy Policy
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400 text-sm">
                                © {new Date().getFullYear()} Aucto. All rights reserved.
                            </p>
                            <div className="flex items-center space-x-4 mt-4 md:mt-0">
                                <span className="text-gray-400 text-sm">Made with</span>
                                <Heart size={18} color="red" fill='red' />
                                <span className="text-gray-400 text-sm">for auction enthusiasts</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Footer;