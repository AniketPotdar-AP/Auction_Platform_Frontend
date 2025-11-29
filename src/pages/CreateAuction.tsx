import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuctionStore } from '../stores/auctionStore';
import { useAuthStore } from '../stores/authStore';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Info } from 'lucide-react';
import CustomInput from '../components/CustomInput';
import CustomSelect from '../components/CustomSelect';

const CreateAuction: React.FC = () => {
    const navigate = useNavigate();
    const { createAuction, isLoading } = useAuctionStore();
    const { user } = useAuthStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        condition: 'New',
        basePrice: '',
        minAuctionAmount: '',
        startTime: null as Date | null,
        endTime: null as Date | null,
        deliveryOptions: 'Shipping',
        termsAndConditions: ''
    });

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
        const { name, value } = e.target || e;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // If basePrice changes, update minAuctionAmount to match
            ...(name === 'basePrice' && { minAuctionAmount: value })
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length + images.length > 5) {
            setErrors(prev => ({
                ...prev,
                images: 'Maximum 5 images allowed'
            }));
            return;
        }

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        setImages(prev => [...prev, ...files]);

        if (errors.images) {
            setErrors(prev => ({
                ...prev,
                images: ''
            }));
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        // Revoke the object URL to free memory
        URL.revokeObjectURL(imagePreviews[index]);
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.condition) newErrors.condition = 'Condition is required';
        if (!formData.basePrice || parseInt(formData.basePrice) <= 0) {
            newErrors.basePrice = 'Valid starting price is required';
        }
        if (formData.basePrice && !Number.isInteger(parseFloat(formData.basePrice))) {
            newErrors.basePrice = 'Starting price must be a whole number';
        }
        if (!formData.startTime) newErrors.startTime = 'Start time is required';
        if (!formData.endTime) newErrors.endTime = 'End time is required';

        // Check if end time is after start time
        if (formData.startTime && formData.endTime) {
            if (formData.endTime <= formData.startTime) {
                newErrors.endTime = 'End time must be after start time';
            }
        }

        // Check if start time is in the future
        if (formData.startTime) {
            const now = new Date();
            if (formData.startTime <= now) {
                newErrors.startTime = 'Start time must be in the future';
            }
        }

        if (images.length === 0) newErrors.images = 'At least one image is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            // Create FormData for file upload
            const submitData = new FormData();

            // Add form fields, ensuring minAuctionAmount equals basePrice
            const finalFormData = {
                ...formData,
                basePrice: parseInt(formData.basePrice),
                minAuctionAmount: parseInt(formData.basePrice) // Ensure they are the same
            };

            Object.entries(finalFormData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) { // Only add non-empty values
                    if (value instanceof Date) {
                        submitData.append(key, value.toISOString());
                    } else {
                        submitData.append(key, value.toString());
                    }
                }
            });

            // Add images
            images.forEach((image) => {
                submitData.append('images', image);
            });

            await createAuction(submitData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error creating auction:', error);
        }
    };

    // Check if user is verified
    if (!user?.permissions?.canCreateAuction) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-lg rounded-lg p-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <Info size={60} style={{ color: '#FFB300' }} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Verification Required</h1>
                        <p className="text-gray-600 mb-6">
                            To create auctions, you need to verify your identity by uploading your Aadhaar documents.
                            Your documents will be reviewed by our team, and you'll be notified once verified.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Button
                                label="Upload Documents"
                                icon="pi pi-upload"
                                className="p-button-primary w-full"
                                onClick={() => navigate('/profile')}
                            />
                            <Button
                                label="Go to Dashboard"
                                icon="pi pi-home"
                                className="p-button-secondary w-full"
                                onClick={() => navigate('/dashboard')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold" style={{ color: '#1A73E8' }}>Create New Auction</h1>
                        <p className="mt-1 text-gray-600">Fill in the details to create your auction</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <CustomInput
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter auction title"
                                required
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <InputTextarea
                                id="description"
                                name="description"
                                className='w-full'
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Describe your item in detail"
                                required
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>

                        {/* Category and Subcategory */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <CustomSelect
                                    id="category"
                                    name="category"
                                    placeholder="Select Category"
                                    value={formData.category}
                                    options={[
                                        { label: 'Select Category', value: '' },
                                        { label: 'Electronics', value: 'Electronics' },
                                        { label: 'Clothing', value: 'Clothing' },
                                        { label: 'Vehicles', value: 'Vehicles' },
                                        { label: 'Art', value: 'Art' },
                                        { label: 'Collectibles', value: 'Collectibles' },
                                        { label: 'Accessories', value: 'Accessories' }
                                    ]}
                                    onChange={handleInputChange}
                                />
                                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                            </div>

                            <div>
                                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subcategory
                                </label>
                                <CustomInput
                                    id="subcategory"
                                    name="subcategory"
                                    value={formData.subcategory}
                                    onChange={handleInputChange}
                                    placeholder="Optional subcategory"
                                />
                            </div>
                        </div>

                        {/* Condition and Delivery Options */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                                    Condition *
                                </label>
                                <CustomSelect
                                    id="condition"
                                    name="condition"
                                    value={formData.condition}
                                    options={[
                                        { label: 'New', value: 'New' },
                                        { label: 'Like New', value: 'Like New' },
                                        { label: 'Good', value: 'Good' },
                                        { label: 'Fair', value: 'Fair' },
                                        { label: 'Poor', value: 'Poor' }
                                    ]}
                                    onChange={handleInputChange}
                                />
                                {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
                            </div>

                            <div>
                                <label htmlFor="deliveryOptions" className="block text-sm font-medium text-gray-700 mb-2">
                                    Delivery Options
                                </label>
                                <CustomSelect
                                    id="deliveryOptions"
                                    name="deliveryOptions"
                                    value={formData.deliveryOptions}
                                    options={[
                                        { label: 'Shipping', value: 'Shipping' },
                                        { label: 'Pickup', value: 'Pickup' },
                                        { label: 'Both', value: 'Both' }
                                    ]}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* Pricing */}
                        <div>
                            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                                Starting Price (₹) *
                            </label>
                            <CustomInput
                                type="number"
                                id="basePrice"
                                name="basePrice"
                                value={formData.basePrice}
                                onChange={handleInputChange}
                                placeholder="1000"
                                min="1"
                                step="1"
                            />
                            <p className="mt-1 text-xs text-gray-600">This will be the minimum bid amount for this auction</p>
                            {errors.basePrice && <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>}
                        </div>

                        {/* Time Settings */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            <div className="field">
                                <label htmlFor="startTime" className="block text-sm font-medium mb-2">
                                    Start Time *
                                </label>
                                <Calendar
                                    id="startTime"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.value as Date | null })}
                                    showTime
                                    hourFormat="24"
                                    minDate={new Date()}
                                    className={errors.startTime ? 'p-invalid w-full' : 'w-full'}
                                />
                                {errors.startTime && <Message severity="error" text={errors.startTime} className="mt-1" />}
                            </div>

                            <div className="field">
                                <label htmlFor="endTime" className="block text-sm font-medium mb-2">
                                    End Time *
                                </label>
                                <Calendar
                                    id="endTime"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.value as Date | null })}
                                    showTime
                                    hourFormat="24"
                                    minDate={formData.startTime || new Date()}
                                    className={errors.endTime ? 'p-invalid w-full' : 'w-full'}
                                />
                                {errors.endTime && <Message severity="error" text={errors.endTime} className="mt-1" />}
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div>
                            <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700 mb-2">
                                Terms & Conditions
                            </label>
                            <InputTextarea
                                id="termsAndConditions"
                                name="termsAndConditions"
                                className='w-full'
                                value={formData.termsAndConditions}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Optional terms and conditions for this auction"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Images * (Max 5 images)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-2 pt-4 ">
                            <Button
                                type="button"
                                label="Cancel"
                                icon="pi pi-times"
                                className="p-button-secondary"
                                onClick={() => navigate('/dashboard')}
                            />
                            <Button
                                type="submit"
                                label={isLoading ? 'Creating...' : 'Create Auction'}
                                icon="pi pi-plus"
                                loading={isLoading}
                                className="p-button-primary"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateAuction;