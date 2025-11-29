import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Clock, Mail, Map, Phone } from 'lucide-react';

const ContactUs: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
                    <p className="text-xl text-gray-600">
                        We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div>
                        <Card className="h-full">
                            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Get in Touch</h2>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="w-1 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                                        <Map />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Address</h3>
                                        <p className="text-gray-600">
                                            123 Auction Street<br />
                                            Pune, Maharashtra 400001<br />
                                            India
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-1 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                                        <Phone />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Phone</h3>
                                        <p className="text-gray-600">+91 98765 43210</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-1 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                        <Mail />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Email</h3>
                                        <p className="text-gray-600">support@aucto.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-1 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                                        <Clock />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Business Hours</h3>
                                        <p className="text-gray-600">
                                            Monday - Friday: 9:00 AM - 6:00 PM<br />
                                            Saturday: 10:00 AM - 4:00 PM<br />
                                            Sunday: Closed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <Card>
                            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Send us a Message</h2>

                            {submitted && (
                                <Message
                                    severity="success"
                                    text="Thank you for your message! We'll get back to you soon."
                                    className="mb-4"
                                />
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <InputText
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <InputText
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <InputText
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <InputTextarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    label={isSubmitting ? 'Sending...' : 'Send Message'}
                                    loading={isSubmitting}
                                    className="w-full"
                                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none' }}
                                />
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;