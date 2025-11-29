import React from 'react';
import { Card } from 'primereact/card';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-xl text-gray-600">
                        Your privacy is important to us. Learn how we collect, use, and protect your information.
                    </p>
                </div>

                <Card className="shadow-lg">
                    <div className="prose prose-lg max-w-none">
                        <p className="text-sm text-gray-500 mb-6">
                            Last updated: {new Date().toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                            <h3 className="text-xl font-medium text-gray-800 mb-3">Personal Information</h3>
                            <p className="text-gray-700 mb-4">
                                We collect information you provide directly to us, such as when you create an account,
                                participate in auctions, or contact us for support. This may include:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                                <li>Name and contact information</li>
                                <li>Email address and phone number</li>
                                <li>Aadhaar number and verification documents</li>
                                <li>Payment information</li>
                                <li>Profile information and preferences</li>
                            </ul>

                            <h3 className="text-xl font-medium text-gray-800 mb-3">Usage Information</h3>
                            <p className="text-gray-700 mb-4">
                                We automatically collect certain information about your use of our platform, including:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                                <li>Device information and browser type</li>
                                <li>IP address and location data</li>
                                <li>Pages visited and time spent on our platform</li>
                                <li>Auction participation and bidding history</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                                <li>Provide and maintain our auction platform</li>
                                <li>Process transactions and send related information</li>
                                <li>Verify your identity and prevent fraud</li>
                                <li>Communicate with you about our services</li>
                                <li>Improve our platform and develop new features</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
                            <p className="text-gray-700 mb-4">
                                We do not sell, trade, or otherwise transfer your personal information to third parties
                                except in the following circumstances:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                                <li>With your consent</li>
                                <li>To comply with legal obligations</li>
                                <li>To protect our rights and prevent fraud</li>
                                <li>With service providers who assist our operations</li>
                                <li>In connection with a business transfer</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
                            <p className="text-gray-700 mb-4">
                                We implement appropriate technical and organizational measures to protect your personal
                                information against unauthorized access, alteration, disclosure, or destruction. These
                                measures include:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                                <li>Encryption of sensitive data</li>
                                <li>Secure server infrastructure</li>
                                <li>Regular security audits</li>
                                <li>Access controls and authentication</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
                            <p className="text-gray-700 mb-4">You have the right to:</p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                                <li>Access and update your personal information</li>
                                <li>Request deletion of your data</li>
                                <li>Object to or restrict processing</li>
                                <li>Data portability</li>
                                <li>Withdraw consent where applicable</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
                            <p className="text-gray-700 mb-4">
                                We use cookies and similar technologies to enhance your experience on our platform.
                                You can control cookie settings through your browser preferences.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Children's Privacy</h2>
                            <p className="text-gray-700 mb-4">
                                Our platform is not intended for children under 18 years of age. We do not knowingly
                                collect personal information from children under 18.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to This Policy</h2>
                            <p className="text-gray-700 mb-4">
                                We may update this Privacy Policy from time to time. We will notify you of any material
                                changes by posting the new policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
                            <p className="text-gray-700">
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">
                                    <strong>Email:</strong> privacy@aucto.com<br />
                                    <strong>Phone:</strong> +91 98765 43210<br />
                                    <strong>Address:</strong> 123 Auction Street, Mumbai, Maharashtra 400001, India
                                </p>
                            </div>
                        </section>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PrivacyPolicy;