import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { InputTextarea } from 'primereact/inputtextarea';
import CustomInput from '../components/CustomInput';

const Profile: React.FC = () => {
    const { user, updateProfile } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });

    const [aadhaarData, setAadhaarData] = useState({
        aadhaarNumber: '',
        aadhaarImages: [] as File[]
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;

        if (name === 'aadhaarNumber') {
            setAadhaarData(prev => ({
                ...prev,
                aadhaarNumber: value
            }));
        } else if (name === 'aadhaarImages' && files) {
            const selectedFiles = Array.from(files);
            if (selectedFiles.length + aadhaarData.aadhaarImages.length > 2) {
                setError('Maximum 2 Aadhaar images allowed');
                return;
            }

            setAadhaarData(prev => ({
                ...prev,
                aadhaarImages: [...prev.aadhaarImages, ...selectedFiles]
            }));

            // Create previews
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeAadhaarImage = (index: number) => {
        setAadhaarData(prev => ({
            ...prev,
            aadhaarImages: prev.aadhaarImages.filter((_, i) => i !== index)
        }));

        URL.revokeObjectURL(imagePreviews[index]);
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await updateProfile(formData);
            setSuccess('Profile updated successfully!');
        } catch (error: any) {
            setError(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAadhaarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (!aadhaarData.aadhaarNumber || aadhaarData.aadhaarImages.length === 0) {
            setError('Aadhaar number and at least one image are required');
            setIsLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('aadhaarNumber', aadhaarData.aadhaarNumber);
            aadhaarData.aadhaarImages.forEach((file) => {
                formDataToSend.append('images', file);
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/upload-aadhaar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Aadhaar documents uploaded successfully! They will be verified by our admin team.');
                setAadhaarData({ aadhaarNumber: '', aadhaarImages: [] });
                setImagePreviews([]);
            } else {
                setError(data.message || 'Failed to upload Aadhaar documents');
            }
        } catch (error: any) {
            setError(error.message || 'Failed to upload Aadhaar documents');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto mt-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Profile Management</h1>
                    <p className="mt-2 text-600">Update your profile information and manage verification documents</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profile Information */}
                    <Card title="Personal Information" className="shadow-modern">
                        <form onSubmit={handleProfileUpdate} className="p-fluid">
                            <div className="field mb-4">
                                <label htmlFor="name" className="block text-sm font-medium mb-2">
                                    Full Name
                                </label>
                                <CustomInput
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="field mb-4">
                                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                    Phone Number
                                </label>
                                <CustomInput
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="field mb-4">
                                <label htmlFor="address" className="block text-sm font-medium mb-2">
                                    Address
                                </label>
                                <InputTextarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>

                            {error && (
                                <Message severity="error" text={error} className="mb-4" />
                            )}

                            {success && (
                                <Message severity="success" text={success} className="mb-4" />
                            )}

                            <Button
                                type="submit"
                                label={isLoading ? 'Updating...' : 'Update Profile'}
                                loading={isLoading}
                                className="w-full p-button-primary"
                            />
                        </form>
                    </Card>

                    {/* Aadhaar Verification */}
                    <Card title="Aadhaar Verification" subTitle="Upload your Aadhaar documents for account verification" className="shadow-modern">
                        {/* Verification Status */}
                        <div className="mb-6 flex justify-content-between align-items-center">
                            <span className="text-sm font-medium">Verification Status</span>
                            <Tag
                                value={user?.verificationStatus || 'Not submitted'}
                                severity={
                                    user?.verificationStatus === 'verified' ? 'success' :
                                        user?.verificationStatus === 'rejected' ? 'danger' : 'warning'
                                }
                            />
                        </div>

                        {user?.verificationStatus !== 'verified' && (
                            <form onSubmit={handleAadhaarSubmit} className="p-fluid">
                                <div className="field mb-4">
                                    <label htmlFor="aadhaarNumber" className="block text-sm font-medium mb-2">
                                        Aadhaar Number
                                    </label>
                                    <CustomInput
                                        type="text"
                                        id="aadhaarNumber"
                                        name="aadhaarNumber"
                                        value={aadhaarData.aadhaarNumber}
                                        onChange={handleAadhaarChange}
                                        placeholder="Enter 12-digit Aadhaar number"
                                        required
                                    />
                                </div>

                                <div className="field mb-4">
                                    <label htmlFor="aadhaarImages" className="block text-sm font-medium mb-2">
                                        Aadhaar Images (Front & Back)
                                    </label>
                                    <input
                                        type="file"
                                        id="aadhaarImages"
                                        name="aadhaarImages"
                                        accept="image/*"
                                        multiple
                                        onChange={handleAadhaarChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <p className="text-xs text-500 mt-1">Upload front and back images of your Aadhaar card</p>
                                </div>

                                {/* Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={preview}
                                                    alt={`Aadhaar ${index + 1}`}
                                                    className="w-full h-12rem object-cover border-round"
                                                />
                                                <Button
                                                    type="button"
                                                    icon="pi pi-times"
                                                    className="p-button-danger p-button-rounded p-button-text absolute top-0 right-0 mt-1 mr-1"
                                                    onClick={() => removeAadhaarImage(index)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {error && (
                                    <Message severity="error" text={error} className="mb-4" />
                                )}

                                {success && (
                                    <Message severity="success" text={success} className="mb-4" />
                                )}

                                <Button
                                    type="submit"
                                    label={isLoading ? 'Uploading...' : 'Upload for Verification'}
                                    loading={isLoading}
                                    className="w-full p-button-success"
                                />
                            </form>
                        )}

                        {user?.verificationStatus === 'verified' && (
                            <div className="text-center py-8">
                                <i className="pi pi-check-circle text-green-600 text-4xl mb-3"></i>
                                <p className="text-green-600 font-medium">Your account is verified!</p>
                                <p className="text-sm text-600 mt-1">You have verified status on the platform</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;