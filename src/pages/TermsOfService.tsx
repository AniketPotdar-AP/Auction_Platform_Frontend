import React from 'react';
import { Card } from 'primereact/card';

const TermsOfService: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                    <p className="text-xl text-gray-600">
                        Please read these terms carefully before using our auction platform.
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
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-700 mb-4">
                                By accessing and using Aucto ("the Platform"), you accept and agree to be bound by the
                                terms and provision of this agreement. If you do not agree to abide by the above,
                                please do not use this service.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Accounts</h2>
                            <h3 className="text-xl font-medium text-gray-800 mb-3">Registration</h3>
                            <p className="text-gray-700 mb-4">
                                To use certain features of the Platform, you must register for an account. You agree to:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                                <li>Provide accurate and complete information</li>
                                <li>Maintain the security of your password</li>
                                <li>Accept responsibility for all activities under your account</li>
                                <li>Notify us immediately of any unauthorized use</li>
                            </ul>

                            <h3 className="text-xl font-medium text-gray-800 mb-3">Verification</h3>
                            <p className="text-gray-700 mb-4">
                                Certain features require identity verification through Aadhaar or other documents.
                                You agree to provide valid documentation when requested.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Auction Rules</h2>
                            <h3 className="text-xl font-medium text-gray-800 mb-3">Creating Auctions</h3>
                            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                                <li>All auctions must comply with applicable laws</li>
                                <li>You must accurately describe items and their condition</li>
                                <li>You must have legal right to sell the items</li>
                                <li>Prohibited items include illegal substances, weapons, and counterfeit goods</li>
                            </ul>

                            <h3 className="text-xl font-medium text-gray-800 mb-3">Bidding</h3>
                            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                                <li>All bids are binding and cannot be retracted</li>
                                <li>You must have sufficient funds to complete purchases</li>
                                <li>Shill bidding and bid manipulation are prohibited</li>
                                <li>The highest bidder at auction end wins the item</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payments and Fees</h2>
                            <p className="text-gray-700 mb-4">
                                Aucto may charge fees for certain services. All applicable fees will be clearly
                                disclosed before you incur them.
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                                <li>Payment is due immediately upon winning an auction</li>
                                <li>Late payments may result in account suspension</li>
                                <li>All payments are processed securely through approved methods</li>
                                <li>Refunds are provided according to our refund policy</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prohibited Activities</h2>
                            <p className="text-gray-700 mb-4">You agree not to:</p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                                <li>Violate any applicable laws or regulations</li>
                                <li>Post false, misleading, or fraudulent information</li>
                                <li>Interfere with the Platform's operations</li>
                                <li>Harass, abuse, or harm other users</li>
                                <li>Use automated tools for bidding or scraping</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Content and Intellectual Property</h2>
                            <p className="text-gray-700 mb-4">
                                You retain ownership of content you submit to the Platform. By submitting content,
                                you grant us a license to use, display, and distribute it as necessary for platform operations.
                            </p>
                            <p className="text-gray-700 mb-4">
                                The Platform and its original content are protected by copyright and other intellectual
                                property laws. You may not reproduce or distribute our content without permission.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimers and Limitation of Liability</h2>
                            <p className="text-gray-700 mb-4">
                                The Platform is provided "as is" without warranties of any kind. We do not guarantee
                                the accuracy, completeness, or reliability of any content or services.
                            </p>
                            <p className="text-gray-700 mb-4">
                                In no event shall Aucto be liable for any indirect, incidental, special, or consequential
                                damages arising out of your use of the Platform.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
                            <p className="text-gray-700 mb-4">
                                We may terminate or suspend your account immediately for violations of these terms.
                                Upon termination, your right to use the Platform ceases immediately.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Governing Law</h2>
                            <p className="text-gray-700 mb-4">
                                These terms are governed by the laws of India. Any disputes shall be resolved
                                in the courts of Mumbai, Maharashtra.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
                            <p className="text-gray-700 mb-4">
                                We reserve the right to modify these terms at any time. Changes will be effective
                                immediately upon posting. Continued use of the Platform constitutes acceptance
                                of the modified terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
                            <p className="text-gray-700">
                                If you have questions about these Terms of Service, please contact us at:
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">
                                    <strong>Email:</strong> legal@aucto.com<br />
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

export default TermsOfService;